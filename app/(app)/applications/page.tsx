import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ApplicationList } from '@/components/jobs/ApplicationList';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ApplicationsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: apps, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

    if (error) {
        console.error('Failed to load applications:', error);
    }

    return (
        <div className="flex flex-col h-screen overflow-y-auto bg-slate-50">
            <header className="flex h-16 items-center border-b bg-white px-6 w-full justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2 font-semibold text-lg text-primary">
                    <Briefcase className="h-6 w-6" />
                    <span>Application Tracker</span>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/jobs">Find Jobs</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/dashboard">Dashboard</Link>
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
                <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-slate-100">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">My Applications</h1>
                    <p className="text-slate-500 whitespace-pre-wrap">
                        Track and manage your job applications all in one place. Update the status to keep things organized.
                    </p>
                </div>

                <ApplicationList initialApps={apps || []} />
            </main>
        </div>
    );
}
