import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pdvSaleSchema, debtorSchema, expenseSchema } from '@/lib/validations';
import { getAuthUser, isEmployee, isManager } from '@/lib/auth';
import {
  withCache,
  mgetCached,
  invalidateCache,
  CACHE_KEYS,
  TTL,
} from '@/lib/redis';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// ─── GET — Dashboard data (cached per user) ──────────────────────────────────
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!isEmployee(user)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    try {
      // ── 1. Try multi-get for all heavy keys in one round-trip ────────────
      const keys = [
        CACHE_KEYS.dashboardSales(user!.id),
        CACHE_KEYS.dashboardOrders(),
        CACHE_KEYS.dashboardDebtors(),
        CACHE_KEYS.dashboardClients(),
        CACHE_KEYS.dashboardExpenses(),
        CACHE_KEYS.abcReport(),
      ];

      const [
        cachedSales,
        cachedOrders,
        cachedDebtors,
        cachedClients,
        cachedExpenses,
        cachedAbc,
      ] = await mgetCached<unknown>(keys);

      // ── 2. Fetch only what is missing ─────────────────────────────────────
      const [dbSales, dbOrders, dbDebtors, dbClients, dbExpenses, abcReport, activeCaixa] =
        await Promise.all([
          // Sales — per-user (RBAC: employee only sees own sales)
          cachedSales
            ? Promise.resolve(cachedSales as ReturnType<typeof mapSales>)
            : fetchAndCacheSales(user!.id, user!.role),

          // Orders — shared across admins
          cachedOrders
            ? Promise.resolve(cachedOrders as ReturnType<typeof mapOrders>)
            : fetchAndCacheOrders(),

          // Debtors
          cachedDebtors
            ? Promise.resolve(cachedDebtors as ReturnType<typeof mapDebtors>)
            : fetchAndCacheDebtors(),

          // Clients
          cachedClients
            ? Promise.resolve(cachedClients as ReturnType<typeof mapClients>)
            : fetchAndCacheClients(),

          // Expenses
          cachedExpenses
            ? Promise.resolve(cachedExpenses as ReturnType<typeof mapExpenses>)
            : fetchAndCacheExpenses(),

          // ABC Report (most expensive — 5 min TTL)
          cachedAbc
            ? Promise.resolve(cachedAbc as ReturnType<typeof buildAbcReport>)
            : fetchAndCacheAbc(),

          // Active caixa — never cached (must be fresh)
          db.registroCaixa.findFirst({
            where: { closedAt: null },
            include: { despesas: { select: { value: true } } },
          }),
        ]);

      // ── 3. Compute KPIs from (possibly cached) sales ─────────────────────
      const kpis = computeKpis(dbSales, dbDebtors, dbClients);

      return NextResponse.json({
        success: true,
        sales: dbSales,
        debtors: dbDebtors,
        clients: dbClients,
        orders: dbOrders,
        expenses: dbExpenses,
        abcReport,
        kpis,
        activeCaixa: activeCaixa
          ? {
              id: activeCaixa.id,
              openedAt: activeCaixa.openedAt,
              initialAmt: activeCaixa.initialAmt,
              expensesSum: activeCaixa.despesas.reduce((s, e) => s + e.value, 0),
            }
          : null,
        userRole: user!.role,
      });
    } catch (dbError) {
      console.warn('Database offline, returning mock dashboard data:', dbError);
      return NextResponse.json(buildMockData(user!.role));
    }
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno no servidor' }, { status: 500 });
  }
}

// ─── POST — Mutations (always invalidate affected cache keys) ─────────────────
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!isEmployee(user)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    try {
      // === PDV Sale ===
      if (action === 'register_pdv_sale') {
        const parsed = pdvSaleSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Dados inválidos', details: parsed.error.flatten() },
            { status: 400 }
          );
        }

        const { clientPhone, clientName, total, paymentMethod } = parsed.data;

        const openCaixa = await db.registroCaixa.findFirst({ where: { closedAt: null } });
        if (!openCaixa) {
          return NextResponse.json(
            { success: false, error: 'É necessário abrir o caixa antes de registrar vendas.' },
            { status: 400 }
          );
        }

        const cliente = await db.cliente.upsert({
          where: { phone: clientPhone },
          update: clientName ? { name: clientName } : {},
          create: { name: clientName, phone: clientPhone },
        });

        if (paymentMethod === 'PROMISSORIA') {
          const existing = await db.promissoria.findFirst({
            where: { clienteId: cliente.id, isPaid: false },
          });
          if (existing) {
            await db.promissoria.update({
              where: { id: existing.id },
              data: {
                totalDebt: existing.totalDebt + total,
                dueDate: new Date(Date.now() + 30 * 86_400_000),
              },
            });
          } else {
            await db.promissoria.create({
              data: {
                clienteId: cliente.id,
                totalDebt: total,
                dueDate: new Date(Date.now() + 30 * 86_400_000),
              },
            });
          }
        }

        await db.venda.create({
          data: { total, paymentMethod, isPresencial: true, vendedorId: user!.id },
        });

        // Invalidate sales + debtors (promissória may have changed)
        await invalidateCache(
          `dashboard:sales:${user!.id}`,
          `dashboard:debtors`,
          `dashboard:clients`
        );

        return NextResponse.json({ success: true });
      }

      // === Discharge Debtor ===
      if (action === 'discharge_debtor') {
        if (!isManager(user)) {
          return NextResponse.json(
            { success: false, error: 'Apenas gerentes podem dar baixa em promissórias' },
            { status: 403 }
          );
        }
        await db.promissoria.update({ where: { id: body.id }, data: { isPaid: true } });
        await invalidateCache(`dashboard:debtors`);
        return NextResponse.json({ success: true });
      }

      // === Add Debtor ===
      if (action === 'add_debtor') {
        if (!isManager(user)) {
          return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 });
        }
        const parsed = debtorSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Dados inválidos', details: parsed.error.flatten() },
            { status: 400 }
          );
        }

        const { name, phone, amount, dueDate } = parsed.data;
        const cliente = await db.cliente.upsert({
          where: { phone },
          update: { name },
          create: { name, phone },
        });

        const existing = await db.promissoria.findFirst({
          where: { clienteId: cliente.id, isPaid: false },
        });
        if (existing) {
          await db.promissoria.update({
            where: { id: existing.id },
            data: { totalDebt: existing.totalDebt + amount, dueDate: new Date(dueDate) },
          });
        } else {
          await db.promissoria.create({
            data: { clienteId: cliente.id, totalDebt: amount, dueDate: new Date(dueDate) },
          });
        }

        await invalidateCache(`dashboard:debtors`, `dashboard:clients`);
        return NextResponse.json({ success: true });
      }

      // === Add Expense ===
      if (action === 'add_expense') {
        if (!isManager(user)) {
          return NextResponse.json(
            { success: false, error: 'Apenas gerentes e donos podem registrar despesas.' },
            { status: 403 }
          );
        }
        const parsed = expenseSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Dados inválidos', details: parsed.error.flatten() },
            { status: 400 }
          );
        }

        const { description, value, category } = parsed.data;
        const openCaixa = await db.registroCaixa.findFirst({ where: { closedAt: null } });

        await db.despesa.create({
          data: { description, value, category, caixaId: openCaixa?.id || null },
        });

        await invalidateCache(`dashboard:expenses`);
        return NextResponse.json({ success: true });
      }

      // === Open Caixa ===
      if (action === 'open_caixa') {
        const { initialAmt } = body;
        if (typeof initialAmt !== 'number' || initialAmt < 0) {
          return NextResponse.json({ success: false, error: 'Valor inicial inválido' }, { status: 400 });
        }
        const existing = await db.registroCaixa.findFirst({ where: { closedAt: null } });
        if (existing) {
          return NextResponse.json({ success: false, error: 'Já existe um caixa aberto.' }, { status: 400 });
        }
        await db.registroCaixa.create({ data: { initialAmt } });
        return NextResponse.json({ success: true });
      }

      // === Close Caixa ===
      if (action === 'close_caixa') {
        const { finalAmt, notes } = body;
        if (typeof finalAmt !== 'number' || finalAmt < 0) {
          return NextResponse.json({ success: false, error: 'Valor final inválido' }, { status: 400 });
        }

        const active = await db.registroCaixa.findFirst({
          where: { closedAt: null },
          include: { despesas: true },
        });
        if (!active) {
          return NextResponse.json(
            { success: false, error: 'Nenhum caixa aberto encontrado.' },
            { status: 400 }
          );
        }

        const salesDuringCaixa = await db.venda.findMany({
          where: { isPresencial: true, createdAt: { gte: active.openedAt } },
        });

        const salesSum = salesDuringCaixa.reduce((s, v) => s + v.total, 0);
        const expensesSum = active.despesas.reduce((s, e) => s + e.value, 0);
        const expectedAmt = active.initialAmt + salesSum - expensesSum;
        const isBalanced = Math.abs(expectedAmt - finalAmt) < 0.01;

        await db.registroCaixa.update({
          where: { id: active.id },
          data: {
            closedAt: new Date(),
            finalAmt,
            isBalanced,
            notes:
              notes ||
              `Fechado por ${user!.name}. Esperado: ${expectedAmt.toFixed(2)}, Informado: ${finalAmt.toFixed(2)}`,
          },
        });

        // Invalidate all sales-related caches after closing
        await invalidateCache(`dashboard:sales:${user!.id}`, `dashboard:expenses`);

        return NextResponse.json({ success: true, isBalanced, expectedAmt });
      }

      return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
    } catch (dbError) {
      console.warn('Database offline, mocking action response:', dbError);
      if (['register_pdv_sale', 'add_debtor', 'add_expense', 'open_caixa', 'discharge_debtor'].includes(action)) {
        return NextResponse.json({ success: true });
      }
      if (action === 'close_caixa') {
        return NextResponse.json({ success: true, isBalanced: true, expectedAmt: body.finalAmt || 500 });
      }
      return NextResponse.json({ success: false, error: 'Ação falhou' }, { status: 500 });
    }
  } catch (error) {
    console.error('Admin POST error:', error);
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ─── Private fetch+cache helpers ─────────────────────────────────────────────

type SaleRow = { id: string; client: string; total: number; method: string; date: string };
type OrderRow = { id: string; clientName: string; total: number; status: string; paymentMethod: string; date: string; items: { name: string; qty: number; price: number }[] };
type DebtorRow = { id: string; name: string; phone: string; amount: number; dueDate: string; isOverdue: boolean; isPaid: boolean };
type ClientRow = { name: string; phone: string; date: string };
type ExpenseRow = { id: string; description: string; value: number; category: string; date: string };
type AbcRow = { name: string; category: string; quantity: number; revenue: number };

function mapSales(rows: Awaited<ReturnType<typeof db.venda.findMany>>): SaleRow[] {
  return rows.map((s) => ({
    id: s.id,
    client: s.isPresencial ? 'Cliente PDV Presencial' : 'Cliente E-commerce',
    total: s.total,
    method: s.paymentMethod,
    date: s.createdAt.toISOString().split('T')[0],
  }));
}

function mapOrders(
  rows: Awaited<ReturnType<typeof db.pedido.findMany<{ include: { cliente: true; itens: { include: { produto: { select: { name: true } } } } } }>>>
): OrderRow[] {
  return rows.map((o) => ({
    id: o.id,
    clientName: o.cliente.name || 'Cliente',
    total: o.total,
    status: o.status,
    paymentMethod: o.paymentMethod,
    date: o.createdAt.toISOString().split('T')[0],
    items: o.itens.map((i) => ({ name: i.produto.name, qty: i.quantity, price: i.price })),
  }));
}

function mapDebtors(
  rows: Awaited<ReturnType<typeof db.promissoria.findMany<{ include: { cliente: true } }>>>
): DebtorRow[] {
  return rows.map((d) => ({
    id: d.id,
    name: d.cliente.name || 'Sem Nome',
    phone: d.cliente.phone,
    amount: d.totalDebt,
    dueDate: d.dueDate.toISOString().split('T')[0],
    isOverdue: new Date(d.dueDate) < new Date() && !d.isPaid,
    isPaid: d.isPaid,
  }));
}

function mapClients(rows: Awaited<ReturnType<typeof db.cliente.findMany>>): ClientRow[] {
  return rows.map((c) => ({
    name: c.name || 'Membro PR Store',
    phone: c.phone,
    date: c.createdAt.toISOString().split('T')[0],
  }));
}

function mapExpenses(rows: Awaited<ReturnType<typeof db.despesa.findMany>>): ExpenseRow[] {
  return rows.map((e) => ({
    id: e.id,
    description: e.description,
    value: e.value,
    category: e.category,
    date: e.createdAt.toISOString().split('T')[0],
  }));
}

async function buildAbcReport(): Promise<AbcRow[]> {
  const topSelling = await db.itemPedido.groupBy({
    by: ['produtoId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  });
  const ids = topSelling.map((t) => t.produtoId);
  const details = await db.produto.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, price: true, category: true },
  });
  return topSelling.map((t) => {
    const d = details.find((p) => p.id === t.produtoId);
    return {
      name: d?.name || 'Produto Excluído',
      category: d?.category || 'Desconhecido',
      quantity: t._sum.quantity || 0,
      revenue: (t._sum.quantity || 0) * (d?.price || 0),
    };
  });
}

async function fetchAndCacheSales(userId: string, role: string): Promise<SaleRow[]> {
  return withCache(CACHE_KEYS.dashboardSales(userId), TTL.DASHBOARD_SALES, async () => {
    const where = role === 'FUNCIONARIO' ? { vendedorId: userId } : {};
    const rows = await db.venda.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
    return mapSales(rows);
  });
}

async function fetchAndCacheOrders(): Promise<OrderRow[]> {
  return withCache(CACHE_KEYS.dashboardOrders(), TTL.DASHBOARD_ORDERS, async () => {
    const rows = await db.pedido.findMany({
      include: { cliente: true, itens: { include: { produto: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return mapOrders(rows);
  });
}

async function fetchAndCacheDebtors(): Promise<DebtorRow[]> {
  return withCache(CACHE_KEYS.dashboardDebtors(), TTL.DASHBOARD_DEBTORS, async () => {
    const rows = await db.promissoria.findMany({
      include: { cliente: true },
      orderBy: { dueDate: 'asc' },
    });
    return mapDebtors(rows);
  });
}

async function fetchAndCacheClients(): Promise<ClientRow[]> {
  return withCache(CACHE_KEYS.dashboardClients(), TTL.DASHBOARD_CLIENTS, async () => {
    const rows = await db.cliente.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return mapClients(rows);
  });
}

async function fetchAndCacheExpenses(): Promise<ExpenseRow[]> {
  return withCache(CACHE_KEYS.dashboardExpenses(), TTL.DASHBOARD_EXPENSES, async () => {
    const rows = await db.despesa.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    return mapExpenses(rows);
  });
}

async function fetchAndCacheAbc(): Promise<AbcRow[]> {
  return withCache(CACHE_KEYS.abcReport(), TTL.ABC_REPORT, buildAbcReport);
}

// ─── KPI computation (from already-fetched data, no extra DB query) ───────────
function computeKpis(sales: SaleRow[], debtors: DebtorRow[], clients: ClientRow[]) {
  const today = todayStart().toISOString().split('T')[0];
  const month = monthStart().toISOString().split('T')[0];

  const todaySales = sales.filter((s) => s.date >= today);
  const monthSales = sales.filter((s) => s.date >= month);
  const unpaid = debtors.filter((d) => !d.isPaid);

  return {
    todayRevenue: todaySales.reduce((s, v) => s + v.total, 0),
    todayCount: todaySales.length,
    monthRevenue: monthSales.reduce((s, v) => s + v.total, 0),
    monthCount: monthSales.length,
    totalClients: clients.length,
    activeDebtors: unpaid.length,
    totalDebt: unpaid.reduce((s, d) => s + d.amount, 0),
  };
}

// ─── Offline mock (unchanged) ─────────────────────────────────────────────────
function buildMockData(role: string) {
  const sales: SaleRow[] = [
    { id: 's-1', client: 'Cliente PDV', total: 1899.9, method: 'PIX', date: new Date().toISOString().split('T')[0] },
    { id: 's-2', client: 'Cliente E-commerce', total: 1499.9, method: 'CARTAO_CREDITO', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  ];
  const debtors: DebtorRow[] = [
    { id: 'd-1', name: 'Wagner Silva', phone: '45999998888', amount: 499.9, dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], isOverdue: false, isPaid: false },
    { id: 'd-2', name: 'Julio Santos', phone: '45999887766', amount: 1200, dueDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], isOverdue: true, isPaid: false },
  ];
  const clients: ClientRow[] = [
    { name: 'Wagner Silva', phone: '45999998888', date: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
  ];
  const orders: OrderRow[] = [
    { id: 'ord-1', clientName: 'Wagner Silva', total: 1899.9, status: 'PAGO', paymentMethod: 'PIX', date: new Date().toISOString().split('T')[0], items: [{ name: 'Nike Air Jordan 1 Gold', qty: 1, price: 1899.9 }] },
  ];
  const expenses: ExpenseRow[] = [
    { id: 'exp-1', description: 'Aluguel', value: 2500, category: 'FIXO', date: new Date().toISOString().split('T')[0] },
  ];
  const abcReport: AbcRow[] = [
    { name: 'Nike Air Jordan 1 Gold', category: 'Tenis', quantity: 12, revenue: 22798.8 },
  ];

  return {
    success: true,
    sales,
    debtors,
    clients,
    orders,
    expenses,
    abcReport,
    kpis: computeKpis(sales, debtors, clients),
    activeCaixa: { id: 'mock-caixa', openedAt: new Date(Date.now() - 4 * 3600000).toISOString(), initialAmt: 500, expensesSum: 0 },
    userRole: role,
  };
}
