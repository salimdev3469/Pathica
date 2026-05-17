'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { Locale } from '@/lib/locale';
import Link from 'next/link';

type CV = {
    id: string;
    title: string;
};

export default function CoverLetterBuilder({ cvs, locale }: { cvs: CV[], locale: Locale }) {
    const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);
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

    const handleGenerate = async () => {
        setError('');

        setIsGenerating(true);
        try {
            let cvStateData: unknown = null;

            if (selectedCvId) {
                const cvStateRes = await fetch(`/api/cv/${selectedCvId}/state`);
                const cvStatePayload = await cvStateRes.json();
                if (!cvStateRes.ok) {
                    throw new Error(cvStatePayload.error || t('Failed to load selected CV.', 'Seçilen CV yüklenemedi.'));
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
                throw new Error(data.error || t('Failed to generate cover letter.', 'Ön yazı oluşturulamadı.'));
            }

            setGeneratedText(data.coverLetter || '');
            // Optionally, we could redirect to the saved cover letter ID.
            if (data.id) {
                router.push(`/cover-letter/${data.id}`);
                router.refresh();
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('An unexpected error occurred.', 'Beklenmeyen bir hata oluştu.');
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
                        {t('Cover Letter Builder', 'Ön Yazı Oluşturucu')}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {t('Generate a tailored cover letter using your job details, with CV as optional context.', 'İş ilanı detaylarını kullanarak kişiselleştirilmiş bir ön yazı oluşturun; CV eklemek opsiyoneldir.')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">{t('Details', 'Detaylar')}</CardTitle>
                        <CardDescription>{t('Configure your cover letter settings.', 'Ön yazı ayarlarınızı yapılandırın.')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cv-select">{t('Select Base CV (Optional)', 'Temel CV Seçimi (Opsiyonel)')}</Label>
                            <select 
                                id="cv-select"
                                value={selectedCvId} 
                                onChange={e => setSelectedCvId(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                            >
                                <option value="">{t('Continue without CV', 'CV olmadan devam et')}</option>
                                {cvs.map(cv => (
                                    <option key={cv.id} value={cv.id}>{cv.title}</option>
                                ))}
                            </select>
                            {cvs.length === 0 && (
                                <p className="text-xs text-slate-500">
                                    {t('No saved CV found. You can still generate a cover letter.', 'Kayıtlı CV bulunamadı. Yine de ön yazı oluşturabilirsiniz.')}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="job-title">{t('Job Title', 'İş Pozisyonu')}</Label>
                                <Input 
                                    id="job-title" 
                                    placeholder={t('e.g. Frontend Developer', 'Örn. Frontend Developer')} 
                                    value={jobTitle} 
                                    onChange={e => setJobTitle(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company">{t('Company', 'Şirket Adı')}</Label>
                                <Input 
                                    id="company" 
                                    placeholder={t('e.g. Google', 'Örn. Google')} 
                                    value={company} 
                                    onChange={e => setCompany(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="job-description">{t('Job Description', 'İş İlanı Metni')}</Label>
                            <Textarea 
                                id="job-description" 
                                placeholder={t('Paste the job description here...', 'İş ilanı metnini buraya yapıştırın...')}
                                className="min-h-[120px]"
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                            />
                            {!jobDescription && (
                                <div className="flex items-center gap-2 mt-1 text-amber-600 dark:text-amber-500 text-xs bg-amber-50 dark:bg-amber-400/10 p-2 rounded-md border border-amber-200 dark:border-amber-400/20">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{t('Daha kişiselleştirilmiş bir ön yazı için iş ilanı metnini eklemeniz önerilir.', 'Daha kişiselleştirilmiş bir ön yazı için iş ilanı metnini eklemeniz önerilir.')}</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="language">{t('Language', 'Dil')}</Label>
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
                                <Label htmlFor="tone">{t('Tone', 'Ton')}</Label>
                                <select 
                                    id="tone"
                                    value={tone} 
                                    onChange={e => setTone(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <option value="professional">{t('Professional', 'Profesyonel')}</option>
                                    <option value="enthusiastic">{t('Enthusiastic', 'Hevesli')}</option>
                                    <option value="confident">{t('Confident', 'Özgüvenli')}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="length">{t('Length', 'Uzunluk')}</Label>
                                <select 
                                    id="length"
                                    value={length} 
                                    onChange={e => setLength(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <option value="short">{t('Short', 'Kısa')}</option>
                                    <option value="medium">{t('Medium', 'Orta')}</option>
                                    <option value="long">{t('Long', 'Uzun')}</option>
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
                            {isGenerating ? t('Generating...', 'Üretiliyor...') : t('Generate Cover Letter', 'Ön Yazı Üret')}
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="shadow-sm border-slate-200 dark:border-slate-800 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">{t('Result', 'Sonuç')}</CardTitle>
                        <CardDescription>{t('Your generated cover letter will appear here.', 'Oluşturulan ön yazınız burada görünecek.')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col h-full min-h-[400px]">
                        <Textarea 
                            value={generatedText}
                            onChange={(e) => setGeneratedText(e.target.value)}
                            placeholder={t('Click generate to create your tailored cover letter. Once generated, you can edit it here.', 'Ön yazınızı oluşturmak için "Üret" butonuna tıklayın. Oluşturulduktan sonra burada düzenleyebilirsiniz.')}
                            className="flex-1 resize-none h-full min-h-[300px] bg-slate-50/50 dark:bg-slate-900/50 p-4 leading-relaxed"
                            readOnly={isGenerating}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
