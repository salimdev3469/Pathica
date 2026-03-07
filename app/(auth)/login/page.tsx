'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TextShimmer } from '@/components/ui/text-shimmer';

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
    const router = useRouter();
    const supabase = createBrowserClient();
    const isBusy = isLoading || isGoogleLoading;

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setAuthMessage({ type: 'info', text: 'Signing in...' });

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setAuthMessage({ type: 'error', text: error.message });
                toast.error(error.message);
            } else {
                setAuthMessage({ type: 'success', text: 'Login successful. Redirecting to dashboard...' });
                toast.success('Logged in successfully');
                router.push('/dashboard');
            }
        } catch (error) {
            const message = getErrorMessage(error);
            setAuthMessage({ type: 'error', text: `${message}. Please try again.` });
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
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                throw error;
            }
        } catch (error) {
            const message = getErrorMessage(error);
            setAuthMessage({ type: 'error', text: message });
            toast.error(message);
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-50">
            <Link href="/" className="absolute right-4 top-4 z-30 rounded-full bg-white/90 p-2 shadow-md backdrop-blur hover:scale-105 transition-transform" aria-label="Back to landing page">
                <Image src="/logo_pathica.png?v=20260307-121932" alt="Pathica logo" width={56} height={56} className="h-14 w-14 object-contain" />
            </Link>
            {/* Left Video Panel (hidden on small screens) */}
            <div className="relative hidden w-1/2 lg:block bg-slate-900 border-r border-slate-200">
                <video
                    key={`video-${videoIndex}`}
                    src={`/video${videoIndex + 1}.mp4`}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                    onEnded={() => setVideoIndex((prev) => (prev === 0 ? 1 : 0))}
                />
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Decorative Content over video */}
                <div className="absolute bottom-16 left-16 right-16 z-20">
                    <div className="inline-block px-3 py-1 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase">
                        AI-Powered CV Builder
                    </div>
                    <h2 className="text-4xl font-normal tracking-[-0.04em] text-white leading-tight mb-4">
                        Don't let bad formatting <br />
                        ruin your chances.
                    </h2>
                    <p className="text-slate-300 text-lg">
                        Pathica helps you build ATS-compliant resumes that actually reach human recruiters.
                    </p>
                </div>
            </div>

            {/* Right Login Panel */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md space-y-8">
                    <Card className="shadow-none border-0 sm:shadow-lg sm:border sm:border-t-4 sm:border-t-slate-900 bg-transparent sm:bg-white rounded-xl">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-3xl font-medium tracking-tight text-center text-slate-900">Welcome back</CardTitle>
                            <CardDescription className="text-center text-slate-500">
                                Sign in to your account to continue
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <Button variant="outline" onClick={handleGoogleLogin} className="w-full h-11 text-md font-medium rounded-full" disabled={isBusy}>
                                {isGoogleLoading ? (
                                    <TextShimmer as="span" duration={1.2} className="text-sm [--base-color:#64748b] [--base-gradient-color:#0f172a]">
                                        Redirecting to Google...
                                    </TextShimmer>
                                ) : (
                                    <>
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            aria-hidden="true"
                                            focusable="false"
                                            data-prefix="fab"
                                            data-icon="google"
                                            role="img"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 488 512"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                                            ></path>
                                        </svg>
                                        Continue with Google
                                    </>
                                )}
                            </Button>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-50 sm:bg-white px-2 text-slate-500 font-medium">Or continue with e-mail</span>
                                </div>
                            </div>
                            {authMessage && (
                                <div
                                    className={`rounded-md border px-3 py-2 text-sm ${authMessage.type === 'error'
                                            ? 'border-red-200 bg-red-50 text-red-700'
                                            : authMessage.type === 'success'
                                                ? 'border-green-200 bg-green-50 text-green-700'
                                                : 'border-blue-200 bg-blue-50 text-blue-700'
                                        }`}
                                    role="status"
                                    aria-live="polite"
                                >
                                    {authMessage.text}
                                </div>
                            )}
                            <form onSubmit={handleEmailLogin} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11 rounded-full px-4"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-11 rounded-full px-4"
                                    />
                                </div>
                                <Button className="w-full h-11 text-md font-semibold bg-[#1a1a1a] text-white hover:bg-black rounded-full shadow-md" type="submit" disabled={isBusy}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            <TextShimmer as="span" duration={1.2} className="text-sm [--base-color:#bfdbfe] [--base-gradient-color:#ffffff]">
                                                Signing in...
                                            </TextShimmer>
                                        </>
                                    ) : (
                                        'Sign in'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 border-t pt-4 bg-slate-50/50 sm:bg-white rounded-b-xl">
                            <div className="text-sm text-center text-slate-500">
                                Don&apos;t have an account?{' '}
                                <Link href="/register" className="font-semibold text-slate-900 hover:underline">
                                    Sign up
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
