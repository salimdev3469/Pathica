'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Eye, Loader2, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReadOnlyViewer } from '@/components/cv-builder/ReadOnlyViewer';
import type { CVState } from '@/context/CVContext';
import { toast } from 'sonner';

interface CvCardActionsProps {
    cvId: string;
    cvTitle: string;
}

export default function CvCardActions({
    cvId,
    cvTitle
}: CvCardActionsProps) {
    const router = useRouter();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [previewState, setPreviewState] = useState<CVState | null>(null);

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

            toast.success('CV downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            const msg = error instanceof Error ? error.message : 'Failed to download CV';
            toast.error(msg);
        } finally {
            setIsDownloading(false);
        }
    };

    const openPreview = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsPreviewOpen(true);
        setIsPreviewLoading(true);
        setPreviewError(null);

        try {
            const response = await fetch(`/api/cv/${cvId}/state`);
            const data = await response.json().catch(() => null) as CVState | { error?: string } | null;

            if (!response.ok || !data || ('error' in data && typeof data.error === 'string')) {
                const message =
                    data && 'error' in data && typeof data.error === 'string'
                        ? data.error
                        : 'Failed to load preview';
                throw new Error(message);
            }

            setPreviewState(data as CVState);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load preview';
            setPreviewError(message);
            setPreviewState(null);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const openDeleteDialog = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/cv/${cvId}`, { method: 'DELETE' });
            const data = await response.json().catch(() => null) as { error?: string } | null;

            if (!response.ok) {
                throw new Error(data?.error || 'Failed to delete CV');
            }

            toast.success('CV deleted successfully.');
            setIsDeleteDialogOpen(false);
            router.refresh();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete CV';
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-2 mt-4">
                <Button
                    variant="ghost"
                    className="h-10 w-full rounded-xl border border-blue-500/30 bg-blue-500/5 text-blue-500 transition hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400 text-sm font-medium"
                    asChild
                >
                    <Link href={`/cv/${cvId}`}>
                        <Edit2 className="mr-2 h-4 w-4" /> {'Open Editor'}
                    </Link>
                </Button>

                <div className="grid grid-cols-3 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-full min-w-0 justify-center rounded-lg border-blue-500/30 bg-[#05070b] px-2 text-[11px] font-medium text-blue-500 transition hover:bg-blue-500/10 hover:border-blue-500/50 sm:text-xs"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        title={'Download PDF'}
                    >
                        {isDownloading ? (
                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                        ) : (
                            <Download className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="min-w-0 truncate">{'Download PDF'}</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-full min-w-0 justify-center rounded-lg border-blue-500/30 bg-[#05070b] px-2 text-[11px] font-medium text-blue-500 transition hover:bg-blue-500/10 hover:border-blue-500/50 sm:text-xs"
                        onClick={openPreview}
                        disabled={isPreviewLoading}
                        title={'Preview'}
                    >
                        {isPreviewLoading ? (
                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                        ) : (
                            <Eye className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="min-w-0 truncate">{'Preview'}</span>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 w-full min-w-0 justify-center rounded-lg border-rose-500/30 bg-[#05070b] px-2 text-[11px] font-medium text-rose-500 transition hover:bg-rose-500/10 hover:border-rose-500/50 sm:text-xs"
                        onClick={openDeleteDialog}
                        disabled={isDeleting}
                        title={'Delete CV'}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                        ) : (
                            <Trash2 className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="min-w-0 truncate">{'Delete CV'}</span>
                    </Button>
                </div>
            </div>
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="w-[95vw] max-w-6xl">
                    <DialogHeader>
                        <DialogTitle>{cvTitle}</DialogTitle>
                        <DialogDescription>
                            {'Read-only CV preview'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[75vh] overflow-y-auto pr-1">
                        {isPreviewLoading ? (
                            <div className="flex h-[60vh] items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                            </div>
                        ) : null}

                        {!isPreviewLoading && previewError ? (
                            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                                {previewError}
                            </div>
                        ) : null}

                        {!isPreviewLoading && !previewError && previewState ? <ReadOnlyViewer cvState={previewState} /> : null}
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{'Delete this CV?'}</DialogTitle>
                        <DialogDescription>
                            {'This action is permanent. The CV and its sections will be removed.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {cvTitle}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="border-slate-200 dark:border-slate-700"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            {'Cancel'}
                        </Button>
                        <Button
                            type="button"
                            className="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            {'Delete Permanently'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
