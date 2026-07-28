'use client';

import React, { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { useRouter, useParams } from 'next/navigation';

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

      if (isPlaceholder) {
        // Fallback for local development without active Supabase credentials
        const demoUser = {
          uid: 'demo_google_user',
          email: 'shopkeeper@khatamate.com',
          displayName: 'Kirana Owner (Demo)',
        };
        localStorage.setItem('khataflow_user', JSON.stringify(demoUser));
        document.cookie = 'khataflow_session=true; path=/; max-age=31536000; SameSite=Lax;';
        toast.success('Signed in as Kirana Owner (Local Offline Mode)');
        window.location.href = `/${locale}/dashboard`;
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/${locale}/dashboard`,
        },
      });
      if (error) throw error;
      toast.success('Redirecting to Google Sign-In...');
    } catch (err: any) {
      toast.error(err?.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="btn btn-secondary"
      style={{ width: '100%', marginTop: '12px' }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.34 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        />
      </svg>
      {loading ? 'Connecting...' : 'Continue with Google'}
    </button>
  );
}
