import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations';
import { checkRateLimit, authRateLimiter } from '@/lib/redis';
import { getClientIP } from '@/lib/utils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Rate limit: 5 attempts per 15 minutes
    const ip = getClientIP(request);
    const rl = await checkRateLimit(authRateLimiter, `auth:${ip}`);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
        { status: 429 }
      );
    }

    // Validate input
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Email ou senha inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // --- Dev / Mock Bypass (DESATIVADO EM PRODUÇÃO) ---
    if (
      process.env.NODE_ENV !== 'production' &&
      email === 'admin@prstore.com' &&
      password === 'admin123'
    ) {
      const cookieStore = await cookies();
      cookieStore.set('pr-store-mock-auth', JSON.stringify({
        id: 'mock-owner-id',
        email: 'admin@prstore.com',
        role: 'DONO',
        name: 'Wagner (Admin)'
      }), {
        httpOnly: true,
        secure: false, // bloco dev-only (nunca roda em produção)
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 1 day
      });

      return NextResponse.json({
        success: true,
        user: {
          id: 'mock-owner-id',
          email: 'admin@prstore.com',
        },
      });
    }

    // Authenticate via Supabase Auth
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}
