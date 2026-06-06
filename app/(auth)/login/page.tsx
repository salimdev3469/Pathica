'use client';;
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@/lib/supabase';
import { buildAuthCallbackUrl } from '@/lib/auth-redirect';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [locale, setLocale] = useState<Locale>('en');

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const supabase = createBrowserClient();
  const isBusy = isLoading || isGoogleLoading;

  useEffect(() => {
    setLocale(getClientLocale());
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthMessage({ type: 'info', text: 'Signing in...' });

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setAuthMessage({ type: 'error', text: error.message });
        toast.error(error.message);
      } else {
        setAuthMessage({ type: 'success', text: 'Login successful. Redirecting...' });
        toast.success('Logged in successfully');
        window.location.assign(next);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setAuthMessage({ type: 'error', text: `${message}. ${'Please try again.'}` });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setAuthMessage({ type: 'info', text: 'Redirecting to Google sign-in...' });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: buildAuthCallbackUrl(next),
        },
      });

      if (error) throw error;
    } catch (error) {
      const message = getErrorMessage(error);
      setAuthMessage({ type: 'error', text: message });
      toast.error(message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Link
        href="/"
        className="absolute right-4 top-4 z-30 rounded-full bg-white/90 p-2 shadow-md backdrop-blur transition-transform hover:scale-105"
        aria-label={'Back to landing page'}
      >
        <>
          <Image src="/logo_pathica.png?v=20260308-theme" alt="Pathica logo" width={56} height={56} className="h-14 w-14 object-contain dark:hidden" />
          <Image src="/logo_pathica_footer.png?v=20260308-theme" alt="Pathica dark logo" width={56} height={56} className="hidden h-14 w-14 object-contain dark:block" />
        </>
      </Link>
      <div className="relative hidden w-1/2 border-r border-slate-200 bg-slate-900 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.28),transparent_45%),radial-gradient(circle_at_75%_30%,rgba(16,185,129,0.22),transparent_42%),radial-gradient(circle_at_60%_85%,rgba(99,102,241,0.22),transparent_40%),linear-gradient(160deg,#0f172a_0%,#111827_45%,#020617_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 z-20">
          <h2 className="mb-4 text-4xl font-normal leading-tight tracking-[-0.04em] text-white">
            {"Don't let bad formatting"} <br />
            {'ruin your chances.'}
          </h2>
          <p className="text-lg text-slate-300">
            {'Pathica helps you build ATS-compliant resumes that actually reach human recruiters.'}
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center p-4 sm:p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <Card className="rounded-xl border-0 bg-transparent shadow-none sm:border sm:border-t-4 sm:border-t-slate-900 sm:bg-white sm:shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-center text-3xl font-medium tracking-tight text-slate-900">{'Welcome back'}</CardTitle>
              <CardDescription className="text-center text-slate-500">
                {'Sign in to your account to continue'}
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="h-11 w-full rounded-full text-md font-medium border-slate-200 hover:bg-slate-50 transition-all duration-200"
                disabled={isBusy}
              >
                {isGoogleLoading ? (
                  <TextShimmer as="span" duration={1.2} className="text-sm [--base-color:#64748b] [--base-gradient-color:#0f172a]">
                    {'Redirecting to Google...'}
                  </TextShimmer>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {'Continue with Google'}
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-50 px-2 font-medium text-slate-500 sm:bg-white">{'Or continue with e-mail'}</span>
                </div>
              </div>

              {authMessage && (
                <div
                  className={`rounded-md border px-3 py-2 text-sm ${authMessage.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : authMessage.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}
                  role="status"
                  aria-live="polite"
                >
                  {authMessage.text}
                </div>
              )}

              <form onSubmit={handleEmailLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="youremail@address.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-full px-4" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">{'Password'}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-full px-4" />
                </div>

                <Button className="h-11 w-full rounded-full bg-[#1a1a1a] text-md font-semibold text-white shadow-md hover:bg-black" type="submit" disabled={isBusy}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <TextShimmer as="span" duration={1.2} className="text-sm [--base-color:#bfdbfe] [--base-gradient-color:#ffffff]">
                        {'Signing in...'}
                      </TextShimmer>
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 rounded-b-xl border-t bg-slate-50/50 pt-4 sm:bg-white">
              <div className="text-center text-sm text-slate-500">
                {"Don't have an account?"}{' '}
                <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-slate-900 hover:underline">
                  {'Sign up'}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
