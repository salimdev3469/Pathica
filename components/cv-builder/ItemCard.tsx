'use client';

import React, { useState } from 'react';
import type { Locale } from '@/lib/locale';
import { Item, useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface ItemCardProps {
    sectionId: string;
    item: Item;
    locale?: Locale;
}

export function ItemCard({ sectionId, item, locale = 'en' }: ItemCardProps) {
    const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);

    const { dispatch } = useCV();
    const [isExpanded, setIsExpanded] = useState(true);

    const handleUpdate = (updates: Partial<Item>) => {
        dispatch({
            type: 'UPDATE_ITEM',
            payload: { sectionId, itemId: item.id, updates },
        });
    };

    const handleRemove = () => {
        dispatch({ type: 'REMOVE_ITEM', payload: { sectionId, itemId: item.id } });
    };

    return (
        <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 rounded-t-md border-b border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="min-w-0 flex-1 truncate pl-2 text-sm font-medium">
                    {item.title || t('(Untitled Item)', '(Başlıksız Öğe)')} {item.subtitle ? `- ${item.subtitle}` : ''}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10" onClick={handleRemove}>
                    <Trash2 size={16} />
                </Button>
            </div>

            {isExpanded && (
                <div className="flex min-w-0 flex-col gap-3 p-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">{t('Title / Company / School', 'Başlık / Şirket / Okul')}</label>
                            <div className="flex gap-2">
                                <Input value={item.title || ''} onChange={(e) => handleUpdate({ title: e.target.value })} placeholder={t('e.g. Deloitte', 'Örn. Deloitte')} className="h-10 min-w-0 text-sm flex-1" />
                                <Input type="number" min={8} max={36} value={item.titleFontSize ?? 11} onChange={(e) => handleUpdate({ titleFontSize: Number(e.target.value) })} className="h-10 w-16 px-2 text-sm" title={t('Font Size', 'Yazı Büyüklüğü')} />
                            </div>
                        </div>
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">{t('Subtitle / Role / Degree', 'Alt Başlık / Rol / Derece')}</label>
                            <div className="flex gap-2">
                                <Input value={item.subtitle || ''} onChange={(e) => handleUpdate({ subtitle: e.target.value })} placeholder={t('e.g. Data Analyst', 'Örn. Veri Analisti')} className="h-10 min-w-0 text-sm flex-1" />
                                <Input type="number" min={8} max={36} value={item.subtitleFontSize ?? 11} onChange={(e) => handleUpdate({ subtitleFontSize: Number(e.target.value) })} className="h-10 w-16 px-2 text-sm" title={t('Font Size', 'Yazı Büyüklüğü')} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">{t('Date Range', 'Tarih Aralığı')}</label>
                            <div className="flex gap-2">
                                <Input value={item.date || ''} onChange={(e) => handleUpdate({ date: e.target.value })} placeholder={t('e.g. June 2024 - Present', 'Örn. Haziran 2024 - Devam ediyor')} className="h-10 min-w-0 text-sm flex-1" />
                                <Input type="number" min={6} max={24} value={item.dateFontSize ?? 11} onChange={(e) => handleUpdate({ dateFontSize: Number(e.target.value) })} className="h-10 w-16 px-2 text-sm" title={t('Font Size', 'Yazı Büyüklüğü')} />
                            </div>
                        </div>
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">{t('Location', 'Konum')}</label>
                            <div className="flex gap-2">
                                <Input value={item.location || ''} onChange={(e) => handleUpdate({ location: e.target.value })} placeholder={t('e.g. Istanbul', 'Örn. İstanbul')} className="h-10 min-w-0 text-sm flex-1" />
                                <Input type="number" min={6} max={24} value={item.locationFontSize ?? 11} onChange={(e) => handleUpdate({ locationFontSize: Number(e.target.value) })} className="h-10 w-16 px-2 text-sm" title={t('Font Size', 'Yazı Büyüklüğü')} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-1 flex min-w-0 flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500">{t('Bullets / Description', 'Maddeler / Açıklama')}</label>
                        <div className="relative">
                            <Textarea
                                value={item.bullets || ''}
                                onChange={(e) => handleUpdate({ bullets: e.target.value })}
                                placeholder="- Bullet 1&#10;- Bullet 2"
                                className="min-h-[100px] min-w-0 text-sm pr-20"
                            />
                            <div className="absolute right-2 top-2 w-16">
                                <Input type="number" min={6} max={24} value={item.bulletsFontSize ?? 11} onChange={(e) => handleUpdate({ bulletsFontSize: Number(e.target.value) })} className="bg-white px-2 h-8 text-xs" title={t('Font Size', 'Yazı Büyüklüğü')} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}