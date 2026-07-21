import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

export async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware first to resolve locale routing
  const response = intlMiddleware(request);

  // 2. Initialize Supabase SSR client with response cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // 3. Refresh user session
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Extract locale from path if present (e.g., /en/login -> /login)
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  const currentLocale = pathnameIsMissingLocale
    ? defaultLocale
    : pathname.split('/')[1];

  const cleanPathname = pathnameIsMissingLocale
    ? pathname
    : pathname.replace(`/${currentLocale}`, '') || '/';

  const isAuthRoute = cleanPathname === '/login' || cleanPathname === '/register' || cleanPathname === '/verify';
  const isOnboardingRoute = cleanPathname === '/onboarding';
  const isLandingRoute = cleanPathname === '/landing' || cleanPathname === '/';
  const isPublicRoute = isAuthRoute || isOnboardingRoute || cleanPathname === '/landing' || cleanPathname.startsWith('/api/');

  // If real Supabase keys are configured, enforce route protection
  const hasRealSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (hasRealSupabase) {
    if (!user && !isPublicRoute) {
      const landingUrl = new URL(`/${currentLocale}/landing`, request.url);
      return NextResponse.redirect(landingUrl);
    }

    if (user && isAuthRoute) {
      const dashboardUrl = new URL(`/${currentLocale}`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
