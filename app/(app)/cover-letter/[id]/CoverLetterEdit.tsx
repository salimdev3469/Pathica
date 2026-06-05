'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { Locale } from '@/lib/locale';
import Link from 'next/link';

export default function CoverLetterEdit({ coverLetter, locale }: { coverLetter: any, locale: Locale }) {
    const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);
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
        if (!confirm(t('Are you sure you want to delete this cover letter?', 'Bu ön yazıyı silmek istediğinize emin misiniz?'))) {
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild className="h-10 w-10 p-0 rounded-full">
                        <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {coverLetter.job_title || t('Cover Letter', 'Ön Yazı')}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {coverLetter.company_name}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="h-10 px-4 rounded-lg">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        {t('Delete', 'Sil')}
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="h-10 px-4 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saveSuccess ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> : <Save className="w-4 h-4 mr-2" />)}
                        {saveSuccess ? t('Saved', 'Kaydedildi') : t('Save', 'Kaydet')}
                    </Button>
                </div>
            </div>

            <div className="mt-8 mx-auto w-full max-w-[820px] rounded bg-white shadow-2xl ring-1 ring-slate-900/5">
                <div className="px-8 py-12 sm:px-16 sm:py-24">
                    <Textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[800px] w-full resize-y border-0 bg-transparent p-0 font-serif text-[15px] leading-loose text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400"
                        placeholder={t('Type your cover letter here...', 'Ön yazınızı buraya yazın...')}
                    />
                </div>
            </div>
        </div>
    );
}
