'use client';

import { useState } from 'react';
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

type CV = {
    id: string;
    title: string;
};

export default function CoverLetterBuilder({
    cvs,
    userName
}: {
    cvs: CV[];
    userName?: string;
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
                <div class="content">${text.replace(/\\n/g, '<br>')}</div>
            </body>
            </html>
        `;

        const blob = new Blob(['\\ufeff', htmlContent], {
            type: 'application/msword'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = \`Cover_Letter_\${userName?.replace(/\\s+/g, '_') || 'Document'}.doc\`;
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
                    router.push('/billing?reason=insufficient_credits&feature=cover_letter');
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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" asChild className="h-10 w-10 p-0 rounded-full">
                    <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        {'Cover Letter Builder'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {'Generate a tailored cover letter using your job details, with CV as optional context.'}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">{'Details'}</CardTitle>
                        <CardDescription>{'Configure your cover letter settings.'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cv-select">{'Select Base CV (Optional)'}</Label>
                            <select 
                                id="cv-select"
                                value={selectedCvId} 
                                onChange={e => setSelectedCvId(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                            >
                                <option value="">{'Continue without CV'}</option>
                                {cvs.map(cv => (
                                    <option key={cv.id} value={cv.id}>{cv.title}</option>
                                ))}
                            </select>
                            {cvs.length === 0 && (
                                <p className="text-xs text-slate-500">
                                    {'No saved CV found. You can still generate a cover letter.'}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="job-title">{'Job Title'}</Label>
                                <Input 
                                    id="job-title" 
                                    placeholder={'e.g. Frontend Developer'} 
                                    value={jobTitle} 
                                    onChange={e => setJobTitle(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company">{'Company'}</Label>
                                <Input 
                                    id="company" 
                                    placeholder={'e.g. Google'} 
                                    value={company} 
                                    onChange={e => setCompany(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="job-description">{'Job Description'}</Label>
                            <Textarea 
                                id="job-description" 
                                placeholder={'Paste the job description here...'}
                                className="min-h-[120px]"
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                            />
                            {!jobDescription && (
                                <div className="flex items-center gap-2 mt-1 text-amber-600 dark:text-amber-500 text-xs bg-amber-50 dark:bg-amber-400/10 p-2 rounded-md border border-amber-200 dark:border-amber-400/20">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{'For a more personalized cover letter, we recommend adding the job description.'}</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="language">{'Language'}</Label>
                                <select 
                                    id="language"
                                    value={language} 
                                    onChange={e => setLanguage(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <option value="tr">Türkçe</option>
                                    <option value="en">English</option>
                                    <option value="de">Deutsch</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tone">{'Tone'}</Label>
                                <select 
                                    id="tone"
                                    value={tone} 
                                    onChange={e => setTone(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <option value="professional">{'Professional'}</option>
                                    <option value="enthusiastic">{'Enthusiastic'}</option>
                                    <option value="confident">{'Confident'}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="length">{'Length'}</Label>
                                <select 
                                    id="length"
                                    value={length} 
                                    onChange={e => setLength(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <option value="short">{'Short'}</option>
                                    <option value="medium">{'Medium'}</option>
                                    <option value="long">{'Long'}</option>
                                </select>
                            </div>
                        </div>
                        {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button 
                            onClick={handleGenerate} 
                            disabled={isGenerating} 
                            className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="shadow-sm border-slate-200 dark:border-slate-800 h-full flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-lg">{'Result'}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadDoc}
                                    disabled={!generatedText.trim() || isGenerating}
                                    className="gap-2"
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
                                    className="gap-2"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                        </div>
                        <CardDescription>{'Your generated cover letter will appear here.'}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col h-full min-h-[400px]">
                        <Textarea 
                            value={generatedText}
                            onChange={(e) => setGeneratedText(e.target.value)}
                            placeholder={'Click generate to create your tailored cover letter. Once generated, you can edit it here.'}
                            className="flex-1 resize-none h-full min-h-[300px] bg-slate-50/50 dark:bg-slate-900/50 p-4 leading-relaxed"
                            readOnly={isGenerating}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
