import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/en/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const targetUrl = next.startsWith('/') ? `${origin}${next}` : `${origin}/${next}`;
      const response = NextResponse.redirect(targetUrl);
      response.cookies.set('khataflow_session', 'true', {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
