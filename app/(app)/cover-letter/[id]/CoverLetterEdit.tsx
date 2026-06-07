'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Trash2, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function CoverLetterEdit({
    coverLetter,
    userName,
    userEmail,
}: {
    coverLetter: any;
    userName?: string;
    userEmail?: string;
}) {
    const router = useRouter();

    const [content, setContent] = useState(coverLetter.content || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const res = await fetch(`/api/cv/cover-letter/${coverLetter.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            if (!res.ok) {
                throw new Error('Failed to save.');
            }
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this cover letter?')) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/cv/cover-letter/${coverLetter.id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error('Failed to delete.');
            }

            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            console.error(err);
            setIsDeleting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="space-y-6 print:space-y-0 print:bg-white">
            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { margin: 0; background-color: white !important; }
                    .print\\:hidden { display: none !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:ring-0 { box-shadow: none !important; }
                    .print\\:bg-white { background-color: white !important; }
                    .print\\:block { display: block !important; }
                    textarea { resize: none !important; height: auto !important; overflow: hidden !important; border: none !important; }
                }
            `}</style>
            
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild className="h-10 w-10 p-0 rounded-full">
                        <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {coverLetter.job_title || 'Cover Letter'}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {coverLetter.company_name}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={handlePrint} className="h-10 px-4 rounded-lg bg-white dark:bg-slate-900 dark:text-slate-100">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="h-10 px-4 rounded-lg">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        {'Delete'}
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="h-10 px-4 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saveSuccess ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> : <Save className="w-4 h-4 mr-2" />)}
                        {saveSuccess ? 'Saved' : 'Save'}
                    </Button>
                </div>
            </div>

            <div className="mt-8 mx-auto w-full max-w-[820px] rounded bg-white shadow-2xl ring-1 ring-slate-900/5 print:m-0 print:max-w-none print:shadow-none print:ring-0 print:bg-white print:p-8">
                <div className="px-8 py-12 sm:px-16 sm:py-16 print:p-0 flex flex-col min-h-[1050px] print:min-h-0">
                    <div className="mb-10 pb-6 border-b border-slate-200 print:border-slate-300">
                        <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">{userName}</h1>
                        <div className="mt-2 text-sm text-slate-500 font-serif flex flex-col sm:flex-row sm:gap-4">
                            {userEmail && <span>{userEmail}</span>}
                            <span>{currentDate}</span>
                        </div>
                    </div>
                    
                    <Textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 w-full resize-y border-0 bg-transparent p-0 font-serif text-[15px] leading-loose text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400"
                        placeholder={'Type your cover letter here...'}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                        style={{ height: "auto", minHeight: "800px" }}
                    />
                </div>
            </div>
        </div>
    );
}
