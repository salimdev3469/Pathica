import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, FileText, Calendar, Edit2, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect('/login');
    }

    // Fetch user's CVs
    const { data: cvs } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    // Fetch subscription plan
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single();

    const plan = subscription?.plan || 'free';

    return (
        <div className="flex flex-col h-screen overflow-y-auto bg-slate-50">
            <header className="flex h-16 items-center border-b bg-white px-6 w-full justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 font-semibold text-lg text-primary">
                    <FileText className="h-6 w-6" />
                    <span>CV Builder Pro</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 uppercase font-semibold tracking-wider mr-2">
                        {plan} PLAN
                    </span>
                    <Button variant="outline" asChild>
                        <Link href="/jobs">Find Jobs</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/cv/new">
                            <Plus className="mr-2 h-4 w-4" /> New CV
                        </Link>
                    </Button>
                    <div className="border-l h-6 mx-1"></div>
                    <LogoutButton />
                </div>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">My Resumes</h1>
                    <p className="text-slate-500">Manage and edit your saved CVs.</p>
                </div>

                {cvs && cvs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cvs.map((cv) => (
                            <Card key={cv.id} className="hover:shadow-md transition-shadow group">
                                <CardHeader>
                                    <CardTitle className="text-xl flex justify-between items-start">
                                        <span className="truncate pr-2">{cv.title}</span>
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Updated {formatDistanceToNow(new Date(cv.updated_at))} ago
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex gap-2">
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={`/cv/${cv.id}`}>
                                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-lg">
                        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                            <FileText className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No CVs found</h3>
                        <p className="text-slate-500 mb-6 text-center max-w-sm">
                            You haven't created any CVs yet. Start building your ATS-friendly resume to land your dream job.
                        </p>
                        <Button size="lg" asChild>
                            <Link href="/cv/new">
                                <Plus className="mr-2 h-5 w-5" /> Create Your First CV
                            </Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
