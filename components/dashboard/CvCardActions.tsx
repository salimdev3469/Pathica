'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, Eye, Loader2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CvCardActionsProps {
    cvId: string;
    cvTitle: string;
    atsScore: number | null;
    locale: string;
}

export default function CvCardActions({ cvId, cvTitle, atsScore, locale }: CvCardActionsProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const isTr = locale === 'tr';
    const t = (en: string, tr: string) => (isTr ? tr : en);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsDownloading(true);
        try {
            // 1. Fetch the full state
            const stateRes = await fetch(`/api/cv/${cvId}/state`);
            if (!stateRes.ok) throw new Error('Failed to fetch CV data');
            const state = await stateRes.json();

            // 2. Generate PDF
            const pdfRes = await fetch('/api/cv/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state),
            });

            if (!pdfRes.ok) {
                const errData = await pdfRes.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to generate PDF');
            }

            // 3. Download
            const blob = await pdfRes.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            let filename = cvTitle.replace(/\s+/g, '_');
            if (state.personalInfo?.fullName) {
                filename = state.personalInfo.fullName.replace(/\s+/g, '_');
            }
            a.download = `${filename}_CV.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success(t('CV downloaded successfully!', 'CV başarıyla indirildi!'));
        } catch (error) {
            console.error('Download error:', error);
            const msg = error instanceof Error ? error.message : t('Failed to download CV', 'CV indirilemedi');
            toast.error(msg);
        } finally {
            setIsDownloading(false);
        }
    };

    const previewUrl = `/share/cv/${cvId}?title=${encodeURIComponent(cvTitle)}&score=${atsScore ?? 'Pending'}`;

    return (
        <div className="flex flex-col gap-2 mt-4">
            <Button
                variant="outline"
                className="h-10 w-full rounded-xl border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
                asChild
            >
                <Link href={`/cv/${cvId}`}>
                    <Edit2 className="mr-2 h-4 w-4" /> {t('Open Editor', 'Editörü Aç')}
                </Link>
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800 text-xs font-medium"
                    onClick={handleDownload}
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {t('Download PDF', 'PDF İndir')}
                </Button>
                
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800 text-xs font-medium"
                    asChild
                >
                    <Link href={previewUrl} target="_blank">
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        {t('Preview', 'Önizle')}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
