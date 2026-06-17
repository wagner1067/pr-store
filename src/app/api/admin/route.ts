import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch sales
    const dbSales = await db.venda.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const sales = dbSales.map(s => ({
      id: s.id,
      client: s.isPresencial ? 'Cliente PDV Presencial' : 'Cliente E-commerce',
      phone: '',
      total: s.total,
      method: s.paymentMethod,
      date: s.createdAt.toISOString().split('T')[0],
    }));

    // 2. Fetch debtors (Promissórias)
    const dbDebtors = await db.promissoria.findMany({
      include: { cliente: true },
      orderBy: { dueDate: 'asc' },
    });

    const debtors = dbDebtors.map(d => ({
      id: d.id,
      name: d.cliente.name || 'Cliente Sem Nome',
      phone: d.cliente.phone,
      amount: d.totalDebt,
      dueDate: d.dueDate.toISOString().split('T')[0],
      isOverdue: new Date(d.dueDate) < new Date(),
    }));

    // 3. Fetch clients (captured leads and buyers)
    const dbClients = await db.cliente.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const clients = dbClients.map(c => ({
      name: c.name || 'Membro PR Store',
      phone: c.phone,
      date: c.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json({
      success: true,
      sales,
      debtors,
      clients,
    });
  } catch (error) {
    console.error('Failed to load admin data from DB:', error);
    return NextResponse.json({ success: false, error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'discharge_debtor') {
      const { id } = body;
      await db.promissoria.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'add_debtor') {
      const { name, phone, amount, dueDate } = body;

      // Upsert client
      const cliente = await db.cliente.upsert({
        where: { phone },
        update: { name },
        create: { name, phone },
      });

      // Create or update promissória
      const existingProm = await db.promissoria.findFirst({
        where: { clienteId: cliente.id },
      });

      if (existingProm) {
        await db.promissoria.update({
          where: { id: existingProm.id },
          data: {
            totalDebt: existingProm.totalDebt + parseFloat(amount),
            dueDate: new Date(dueDate),
          },
        });
      } else {
        await db.promissoria.create({
          data: {
            clienteId: cliente.id,
            totalDebt: parseFloat(amount),
            dueDate: new Date(dueDate),
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'register_pdv_sale') {
      const { clientPhone, clientName, total, paymentMethod } = body;
      const totalVal = parseFloat(total);

      // Save client if they have phone
      let clienteId = null;
      if (clientPhone) {
        const cliente = await db.cliente.upsert({
          where: { phone: clientPhone },
          update: clientName ? { name: clientName } : {},
          create: { name: clientName || 'Cliente PDV Presencial', phone: clientPhone },
        });
        clienteId = cliente.id;

        // If it's a promissória, update client debt
        if (paymentMethod === 'PROMISSORIA') {
          const existingProm = await db.promissoria.findFirst({
            where: { clienteId: cliente.id },
          });

          if (existingProm) {
            await db.promissoria.update({
              where: { id: existingProm.id },
              data: {
                totalDebt: existingProm.totalDebt + totalVal,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days due
              },
            });
          } else {
            await db.promissoria.create({
              data: {
                clienteId: cliente.id,
                totalDebt: totalVal,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            });
          }
        }
      }

      // Create sale log
      await db.venda.create({
        data: {
          total: totalVal,
          paymentMethod: paymentMethod === 'PROMISSORIA' ? 'PROMISSORIA' : paymentMethod,
          isPresencial: true,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to execute admin action in DB:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
