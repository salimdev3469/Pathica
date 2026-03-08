'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/locale';

type LogoutButtonProps = {
    className?: string;
    locale?: Locale;
};

export default function LogoutButton({ className, locale = 'en' }: LogoutButtonProps) {
    const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            const supabase = createBrowserClient();
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push('/');
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : t('Error signing out', 'Çıkış yaparken hata oluştu');
            toast.error(message);
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            className={cn('text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300', className)}
            onClick={handleLogout}
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            {t('Log Out', 'Çıkış Yap')}
        </Button>
    );
}