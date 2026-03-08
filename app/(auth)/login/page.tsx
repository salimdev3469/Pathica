'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@/lib/supabase';
import { getClientLocale, type Locale } from '@/lib/locale';
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
  const [videoIndex, setVideoIndex] = useState(0);
  const [locale, setLocale] = useState<Locale>('en');

  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);
  const router = useRouter();
  const supabase = createBrowserClient();
  const isBusy = isLoading || isGoogleLoading;

  useEffect(() => {
    setLocale(getClientLocale());
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthMessage({ type: 'info', text: t('Signing in...', 'Giriş yapılıyor...') });

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setAuthMessage({ type: 'error', text: error.message });
        toast.error(error.message);
      } else {
        setAuthMessage({ type: 'success', text: t('Login successful. Redirecting to dashboard...', 'Giriş başarılı. Panele yönlendiriliyor...') });
        toast.success(t('Logged in successfully', 'Giriş başarılı'));
        router.push('/dashboard');
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setAuthMessage({ type: 'error', text: `${message}. ${t('Please try again.', 'Lütfen tekrar deneyin.')}` });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setAuthMessage({ type: 'info', text: t('Redirecting to Google sign-in...', 'Google girişine yönlendiriliyor...') });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
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
        aria-label={t('Back to landing page', 'Anasayfaya dön')}
      >
        <>
          <Image src="/logo_pathica.png?v=20260308-theme" alt="Pathica logo" width={56} height={56} className="h-14 w-14 object-contain dark:hidden" />
          <Image src="/logo_pathica_footer.png?v=20260308-theme" alt="Pathica dark logo" width={56} height={56} className="hidden h-14 w-14 object-contain dark:block" />
        </>
      </Link>

      <div className="relative hidden w-1/2 border-r border-slate-200 bg-slate-900 lg:block">
        <video
          key={`video-${videoIndex}`}
          src={`/video${videoIndex + 1}.mp4`}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          onEnded={() => setVideoIndex((prev) => (prev === 0 ? 1 : 0))}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 z-20">
          <h2 className="mb-4 text-4xl font-normal leading-tight tracking-[-0.04em] text-white">
            {t("Don't let bad formatting", 'Kötü formatlama')} <br />
            {t('ruin your chances.', 'şansını düşürmesin.')}
          </h2>
          <p className="text-lg text-slate-300">
            {t('Pathica helps you build ATS-compliant resumes that actually reach human recruiters.', 'Pathica, ATS uyumlu özgeçmişler hazırlayarak başvurularının gerçek insanlara ulaşmasına yardım eder.')}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-4 sm:p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <Card className="rounded-xl border-0 bg-transparent shadow-none sm:border sm:border-t-4 sm:border-t-slate-900 sm:bg-white sm:shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-center text-3xl font-medium tracking-tight text-slate-900">{t('Welcome back', 'Tekrar hoş geldin')}</CardTitle>
              <CardDescription className="text-center text-slate-500">
                {t('Sign in to your account to continue', 'Devam etmek için hesabına giriş yap')}
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              <Button variant="outline" onClick={handleGoogleLogin} className="h-11 w-full rounded-full text-md font-medium" disabled={isBusy}>
                {isGoogleLoading ? (
                  <TextShimmer as="span" duration={1.2} className="text-sm [--base-color:#64748b] [--base-gradient-color:#0f172a]">
                    {t('Redirecting to Google...', "Google'a yönlendiriliyor...")}
                  </TextShimmer>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" viewBox="0 0 488 512">
                      <path
                        fill="currentColor"
                        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                      />
                    </svg>
                    {t('Continue with Google', 'Google ile devam et')}
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-50 px-2 font-medium text-slate-500 sm:bg-white">{t('Or continue with e-mail', 'Veya e-posta ile devam et')}</span>
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
                  <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-full px-4" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">{t('Password', 'Şifre')}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-full px-4" />
                </div>

                <Button className="h-11 w-full rounded-full bg-[#1a1a1a] text-md font-semibold text-white shadow-md hover:bg-black" type="submit" disabled={isBusy}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <TextShimmer as="span" duration={1.2} className="text-sm [--base-color:#bfdbfe] [--base-gradient-color:#ffffff]">
                        {t('Signing in...', 'Giriş yapılıyor...')}
                      </TextShimmer>
                    </>
                  ) : (
                    t('Sign in', 'Giriş Yap')
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 rounded-b-xl border-t bg-slate-50/50 pt-4 sm:bg-white">
              <div className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-slate-900 hover:underline">
                  {t('Sign up', 'Kayıt ol')}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}