import { z } from 'zod';

// --- Sanitization Utility ---
const sanitizeString = (val: string) =>
  val.replace(/<[^>]*>/g, '').replace(/[<>"'`;()]/g, '').trim();

const safeString = (min = 1, max = 255) =>
  z.string().min(min).max(max).transform(sanitizeString);

const safePhone = z
  .string()
  .min(10)
  .max(20)
  .regex(/^[\d+\-() ]+$/, 'Telefone inválido')
  .transform(sanitizeString);

// --- E-commerce Schemas ---

export const checkoutItemSchema = z.object({
  id: z.string().min(1),
  name: safeString(1, 200),
  price: z.number().positive().max(999999),
  quantity: z.number().int().positive().max(100),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(50),
  paymentMethod: z.enum(['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO']),
  clientPhone: safePhone,
  clientName: safeString(1, 150).optional().default('Cliente E-commerce'),
  shippingCost: z.number().min(0).max(9999).optional().default(0),
  shippingMethod: z.enum(['CORREIOS', 'MOTO_FRETE', 'RETIRADA']).optional().default('CORREIOS'),
});

export const shippingSchema = z.object({
  cep: z
    .string()
    .min(8)
    .max(9)
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
});

// --- Product Schemas ---

export const productCreateSchema = z.object({
  name: safeString(2, 200),
  price: z.number().positive().max(999999),
  promoPrice: z.number().positive().max(999999).nullable().optional(),
  promoUntil: z.string().datetime().nullable().optional(),
  stock: z.number().int().min(0).max(99999),
  category: z.enum(['Roupas', 'Tenis', 'Acessorios']),
  brand: safeString(1, 100).optional().default('PR Store'),
  sizes: z.array(z.string().max(10)).min(1).max(20),
  images: z.array(z.string().max(2000)).optional().default([]),
  description: safeString(0, 2000).optional(),
});

export const productQuerySchema = z.object({
  category: z.enum(['All', 'Roupas', 'Tenis', 'Acessorios']).optional().default('All'),
  brand: safeString(0, 100).optional(),
  page: z.coerce.number().int().positive().max(1000).optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  cursor: z.string().uuid().optional(),
});

// --- Auth Schemas ---

export const loginSchema = z.object({
  email: z.string().email().max(255).transform(sanitizeString),
  password: z.string().min(6).max(128),
});

export const otpSchema = z.object({
  email: z.string().email().max(255),
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, 'OTP deve conter 6 dígitos'),
});

// --- Admin / PDV Schemas ---

export const pdvSaleSchema = z.object({
  clientPhone: safePhone,
  clientName: safeString(1, 150).optional().default('Cliente PDV'),
  total: z.coerce.number().positive().max(999999),
  paymentMethod: z.enum(['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PROMISSORIA']),
});

export const debtorSchema = z.object({
  name: safeString(2, 150),
  phone: safePhone,
  amount: z.coerce.number().positive().max(999999),
  dueDate: z.string().datetime({ message: 'Data de vencimento inválida' }),
});

export const expenseSchema = z.object({
  description: safeString(2, 300),
  value: z.coerce.number().positive().max(999999),
  category: z.enum(['FIXO', 'VARIAVEL']).optional().default('VARIAVEL'),
});

// --- Chat Schema ---

export const chatMessageSchema = z.object({
  message: safeString(1, 1000),
});

// --- Utility Types ---
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PdvSaleInput = z.infer<typeof pdvSaleSchema>;
export type DebtorInput = z.infer<typeof debtorSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
