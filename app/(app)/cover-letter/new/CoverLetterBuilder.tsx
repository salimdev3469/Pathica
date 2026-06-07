'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, AlertCircle, ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { Locale } from '@/lib/locale';
import Link from 'next/link';
import { toast } from 'sonner';
import BillingModal, { type BillingPackageView } from '@/components/billing/BillingModal';
import { COVER_LETTER_CREDIT_COST } from '@/lib/billing-config';

type CV = {
    id: string;
    title: string;
};

export default function CoverLetterBuilder({
    cvs,
    userName,
    billingPackages,
    billingSchemaMissing
}: {
    cvs: CV[];
    userName?: string;
    billingPackages: BillingPackageView[];
    billingSchemaMissing: boolean;
}) {
    const router = useRouter();

    const [selectedCvId, setSelectedCvId] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [language, setLanguage] = useState('tr');
    const [tone, setTone] = useState('professional');
    const [length, setLength] = useState('medium');

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [copied, setCopied] = useState(false);
    const [billingOpen, setBillingOpen] = useState(false);

    const copyToClipboard = async (text: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        if (typeof document === 'undefined') {
            throw new Error('Clipboard is not available');
        }

        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = text;
        tempTextArea.setAttribute('readonly', '');
        tempTextArea.style.position = 'absolute';
        tempTextArea.style.left = '-9999px';
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        tempTextArea.setSelectionRange(0, tempTextArea.value.length);
        const copiedWithCommand = document.execCommand('copy');
        document.body.removeChild(tempTextArea);

        if (!copiedWithCommand) {
            throw new Error('Copy command failed');
        }
    };

    const handleCopy = async () => {
        const text = generatedText.trim();
        if (!text) {
            return;
        }

        try {
            await copyToClipboard(text);
            setCopied(true);
            toast.success('Cover letter copied to clipboard.');
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            toast.error('Could not copy the cover letter.');
        }
    };

    const handleDownloadDoc = () => {
        const text = generatedText.trim();
        if (!text) return;

        const formattedText = text.replace(/\n/g, '<br>');
        const safeName = userName?.replace(/\s+/g, '_') || 'Document';

        // Create a simple HTML document formatted for A4 printing/editing in Word
        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Cover Letter</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 11pt;
                        line-height: 1.5;
                        color: #000;
                    }
                    @page {
                        size: A4;
                        margin: 2.54cm; /* 1 inch margin */
                    }
                    .header {
                        margin-bottom: 24px;
                    }
                    .name {
                        font-size: 14pt;
                        font-weight: bold;
                    }
                    .content {
                        white-space: pre-wrap;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="name">${userName || 'Your Name'}</div>
                </div>
                <div class="content">${formattedText}</div>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Cover_Letter_${safeName}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleGenerate = async () => {
        setError('');

        setIsGenerating(true);
        try {
            let cvStateData: unknown = null;

            if (selectedCvId) {
                const cvStateRes = await fetch(`/api/cv/${selectedCvId}/state`);
                const cvStatePayload = await cvStateRes.json();
                if (!cvStateRes.ok) {
                    throw new Error(cvStatePayload.error || 'Failed to load selected CV.');
                }
                cvStateData = cvStatePayload;
            }

            const res = await fetch('/api/cv/cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cvState: cvStateData,
                    jobTitle,
                    company,
                    jobDescription,
                    language,
                    tone,
                    length
                })
            });

            const data = (await res.json().catch(() => ({}))) as {
                coverLetter?: string;
                id?: string;
                error?: string;
                code?: string;
            };

            if (!res.ok) {
                if (res.status === 402 || data.code === 'INSUFFICIENT_CREDITS') {
                    setBillingOpen(true);
                    return;
                }
                throw new Error(data.error || 'Failed to generate cover letter.');
            }

            setGeneratedText(data.coverLetter || '');
            // Optionally, we could redirect to the saved cover letter ID.
            if (data.id) {
                router.push(`/cover-letter/${data.id}`);
                router.refresh();
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center gap-4">
                <Button variant="ghost" asChild className="h-10 w-10 p-0 rounded-full">
                    <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        {'Cover Letter Builder'}
                    </h1>
                    <p className="text-sm text-white/60">
                        {'Generate a tailored cover letter using your job details, with CV as optional context.'}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-2xl border border-white/10 bg-white/[0.02] shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">{'Details'}</CardTitle>
                        <CardDescription className="text-white/50">{'Configure your cover letter settings.'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cv-select" className="text-white">{'Select Base CV (Optional)'}</Label>
                            <select 
                                id="cv-select"
                                value={selectedCvId} 
                                onChange={e => setSelectedCvId(e.target.value)}
                                className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 focus:ring-4 focus:ring-white/10"
                            >
                                <option value="" className="bg-zinc-950 text-white">{'Continue without CV'}</option>
                                {cvs.map(cv => (
                                    <option key={cv.id} value={cv.id} className="bg-zinc-950 text-white">{cv.title}</option>
                                ))}
                            </select>
                            {cvs.length === 0 && (
                                <p className="text-xs text-white/50">
                                    {'No saved CV found. You can still generate a cover letter.'}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="job-title" className="text-white">{'Job Title'}</Label>
                                <Input 
                                    id="job-title" 
                                    placeholder={'e.g. Frontend Developer'} 
                                    value={jobTitle} 
                                    onChange={e => setJobTitle(e.target.value)} 
                                    className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-4 focus:ring-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company" className="text-white">{'Company'}</Label>
                                <Input 
                                    id="company" 
                                    placeholder={'e.g. Google'} 
                                    value={company} 
                                    onChange={e => setCompany(e.target.value)} 
                                    className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-4 focus:ring-white/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="job-description" className="text-white">{'Job Description'}</Label>
                            <Textarea 
                                id="job-description" 
                                placeholder={'Paste the job description here...'}
                                className="min-h-[120px] rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-4 focus:ring-white/10"
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                            />
                            {!jobDescription && (
                                <div className="flex items-center gap-2 mt-1 text-amber-500 text-xs bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{'For a more personalized cover letter, we recommend adding the job description.'}</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="language" className="text-white">{'Language'}</Label>
                                <select 
                                    id="language"
                                    value={language} 
                                    onChange={e => setLanguage(e.target.value)}
                                    className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 focus:ring-4 focus:ring-white/10"
                                >
                                    <option value="tr" className="bg-zinc-950 text-white">Türkçe</option>
                                    <option value="en" className="bg-zinc-950 text-white">English</option>
                                    <option value="de" className="bg-zinc-950 text-white">Deutsch</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tone" className="text-white">{'Tone'}</Label>
                                <select 
                                    id="tone"
                                    value={tone} 
                                    onChange={e => setTone(e.target.value)}
                                    className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 focus:ring-4 focus:ring-white/10"
                                >
                                    <option value="professional" className="bg-zinc-950 text-white">{'Professional'}</option>
                                    <option value="enthusiastic" className="bg-zinc-950 text-white">{'Enthusiastic'}</option>
                                    <option value="confident" className="bg-zinc-950 text-white">{'Confident'}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="length" className="text-white">{'Length'}</Label>
                                <select 
                                    id="length"
                                    value={length} 
                                    onChange={e => setLength(e.target.value)}
                                    className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 focus:ring-4 focus:ring-white/10"
                                >
                                    <option value="short" className="bg-zinc-950 text-white">{'Short'}</option>
                                    <option value="medium" className="bg-zinc-950 text-white">{'Medium'}</option>
                                    <option value="long" className="bg-zinc-950 text-white">{'Long'}</option>
                                </select>
                            </div>
                        </div>
                        {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button 
                            onClick={handleGenerate} 
                            disabled={isGenerating} 
                            className="w-full gap-2 rounded-xl bg-white text-slate-950 hover:bg-white/90 shadow-lg"
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="rounded-2xl border border-white/10 bg-white/[0.02] shadow-sm h-full flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-lg text-white">{'Result'}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadDoc}
                                    disabled={!generatedText.trim() || isGenerating}
                                    className="gap-2 rounded-lg border-white/10 bg-transparent text-white hover:bg-white/10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                    {'Download'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopy}
                                    disabled={!generatedText.trim() || isGenerating}
                                    className="gap-2 rounded-lg border-white/10 bg-transparent text-white hover:bg-white/10"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                        </div>
                        <CardDescription className="text-white/50">{'Your generated cover letter will appear here.'}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col h-full min-h-[400px]">
                        <Textarea 
                            value={generatedText}
                            onChange={(e) => setGeneratedText(e.target.value)}
                            placeholder={'Click generate to create your tailored cover letter. Once generated, you can edit it here.'}
                            className="flex-1 resize-none h-full min-h-[300px] rounded-xl border border-white/10 bg-white/5 p-4 leading-relaxed text-white placeholder:text-white/30 focus:border-white/30 focus:ring-4 focus:ring-white/10"
                            readOnly={isGenerating}
                        />
                    </CardContent>
                </Card>
            </div>
            
            {isGenerating && <GeneratingOverlay />}
            
            <BillingModal
                open={billingOpen}
                onOpenChange={setBillingOpen}
                packages={billingPackages}
                creditCost={COVER_LETTER_CREDIT_COST}
                billingSchemaMissing={billingSchemaMissing}
                title="Generate Cover Letter"
                description="You need credits to generate a new cover letter."
            />
        </div>
    );
}

function GeneratingOverlay() {
    const lines = [
        'Reading your selected CV...',
        'Extracting key skills and experiences...',
        'Matching with job requirements...',
        'Writing your professional cover letter...',
        'Almost there, finalizing the draft...'
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = window.setInterval(() => setIndex((current) => (current + 1) % lines.length), 2000);
        return () => window.clearInterval(interval);
    }, [lines.length]);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-zinc-950/90 backdrop-blur-md px-6">
            <div className="absolute inset-x-0 bottom-0 h-2 bg-slate-800">
                <div className="h-full w-full animate-pulse bg-gradient-to-r from-emerald-500 via-orange-600 to-indigo-500 transition-all duration-500 dark:from-emerald-400 dark:via-orange-400 dark:to-indigo-400" />
            </div>
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                    <Sparkles className="h-12 w-12 animate-pulse" />
                    <div className="absolute inset-0 animate-ping rounded-2xl border border-orange-500/30" />
                </div>
                <div className="py-2 text-3xl font-semibold leading-[1.25] md:text-5xl text-white">
                    {lines[index]}
                </div>
            </div>
        </div>
    );
}
