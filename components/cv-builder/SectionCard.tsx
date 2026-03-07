'use client';

import React from 'react';
import { Section, Item, useCV } from '@/context/CVContext';
import { ItemCard } from './ItemCard';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface SectionCardProps {
    section: Section;
}

export function SectionCard({ section }: SectionCardProps) {
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
        <Card className={`mb-4 w-full bg-white shadow-sm transition-shadow`}>
            <div className="flex group">
                <div className="flex-1 p-0">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <Input
                            value={section.title}
                            onChange={(e) => handleUpdateTitle(e.target.value)}
                            className="text-lg font-bold bg-transparent border-transparent hover:border-slate-200 focus-visible:ring-1 p-1 h-9 w-2/3 uppercase text-primary"
                            placeholder="Section Title"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleRemove}
                        >
                            <Trash2 size={18} />
                        </Button>
                    </CardHeader>

                    <CardContent className="p-4 pt-0 flex flex-col gap-3">
                        <div className="flex flex-col gap-3">
                            {(section.items || []).map((item) => (
                                <ItemCard key={item.id} sectionId={section.id} item={item} />
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/50 border-dashed"
                            onClick={handleAddItem}
                        >
                            <Plus size={16} className="mr-1" /> Add Sub-Section
                        </Button>
                    </CardContent>
                </div>
            </div>
        </Card>
    );
}
