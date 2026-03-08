'use client';

import React from 'react';
import type { Locale } from '@/lib/locale';
import { Section, Item, useCV } from '@/context/CVContext';
import { ItemCard } from './ItemCard';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface SectionCardProps {
    section: Section;
    locale?: Locale;
}

export function SectionCard({ section, locale = 'en' }: SectionCardProps) {
    const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);

    const { dispatch } = useCV();

    const handleUpdateTitle = (title: string) => {
        dispatch({ type: 'UPDATE_SECTION', payload: { id: section.id, title } });
    };

    const handleRemove = () => {
        dispatch({ type: 'REMOVE_SECTION', payload: section.id });
    };

    const handleAddItem = () => {
        const newItem: Omit<Item, 'id' | 'position'> = {
            title: '',
            subtitle: '',
            date: '',
            location: '',
            bullets: '',
        };
        dispatch({ type: 'ADD_ITEM', payload: { sectionId: section.id, item: newItem } });
    };

    return (
        <Card className="mb-4 w-full overflow-hidden border border-slate-200 bg-white shadow-sm transition-shadow dark:border-slate-700 dark:bg-slate-900">
            <div className="group flex min-w-0">
                <div className="min-w-0 flex-1 p-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                        <Input
                            value={section.title}
                            onChange={(e) => handleUpdateTitle(e.target.value)}
                            className="h-9 w-full max-w-[78%] border-transparent bg-transparent p-1 text-lg font-bold uppercase text-primary hover:border-slate-200 focus-visible:ring-1 dark:hover:border-slate-600"
                            placeholder={t('Section Title', 'Bölüm Başlığı')}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                            onClick={handleRemove}
                        >
                            <Trash2 size={18} />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3 p-4 pt-0">
                        <div className="flex flex-col gap-3">
                            {(section.items || []).map((item) => (
                                <ItemCard key={item.id} sectionId={section.id} item={item} locale={locale} />
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-dashed border-primary/20 text-primary hover:border-primary/50 hover:bg-primary/5"
                            onClick={handleAddItem}
                        >
                            <Plus size={16} className="mr-1" /> {t('Add Sub-Section', 'Alt Bölüm Ekle')}
                        </Button>
                    </CardContent>
                </div>
            </div>
        </Card>
    );
}