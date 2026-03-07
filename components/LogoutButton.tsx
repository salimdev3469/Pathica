'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LogoutButton() {
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
        } catch (error: any) {
            toast.error(error.message || 'Error signing out');
            setIsLoading(false);
        }
    };

    return (
        <Button variant="ghost" className="text-slate-500 hover:text-red-500 hover:bg-red-50" onClick={handleLogout} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            Log Out
        </Button>
    );
}
