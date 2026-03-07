'use client';

import React, { useState } from 'react';
import { Item, useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface ItemCardProps {
    sectionId: string;
    item: Item;
}

export function ItemCard({ sectionId, item }: ItemCardProps) {
    const { dispatch } = useCV();
    const [isOptimizing, setIsOptimizing] = useState(false);
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

    const handleOptimize = async () => {
        if (!item.bullets) return;
        setIsOptimizing(true);
        try {
            const res = await fetch('/api/cv/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: item.bullets, label: 'Bullet Points' }),
            });
            if (!res.ok) throw new Error('Failed to optimize');
            const data = await res.json();
            handleUpdate({ bullets: data.optimizedText });
            toast.success('Text optimized successfully!');
        } catch (error) {
            toast.error('Could not optimize text. Try again later.');
        } finally {
            setIsOptimizing(false);
        }
    };

    return (
        <div className={`flex flex-col border rounded-md bg-white`}>
            {/* Header / Collapse Bar */}
            <div className="flex items-center gap-2 p-2 bg-slate-50 border-b rounded-t-md">
                <div className="flex-1 font-medium text-sm truncate pl-2">
                    {item.title || '(Untitled Item)'} {item.subtitle ? `- ${item.subtitle}` : ''}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-50" onClick={handleRemove}>
                    <Trash2 size={16} />
                </Button>
            </div>

            {/* Expandable Form */}
            {isExpanded && (
                <div className="p-3 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 font-medium">Title / Company / School</label>
                            <Input value={item.title || ''} onChange={(e) => handleUpdate({ title: e.target.value })} placeholder="e.g. Deloitte" className="h-8 text-sm" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 font-medium">Subtitle / Role / Degree</label>
                            <Input value={item.subtitle || ''} onChange={(e) => handleUpdate({ subtitle: e.target.value })} placeholder="e.g. Data Analyst" className="h-8 text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 font-medium">Date Range</label>
                            <Input value={item.date || ''} onChange={(e) => handleUpdate({ date: e.target.value })} placeholder="e.g. June 2024 - Present" className="h-8 text-sm" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 font-medium">Location</label>
                            <Input value={item.location || ''} onChange={(e) => handleUpdate({ location: e.target.value })} placeholder="e.g. Hyderabad" className="h-8 text-sm" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                        <label className="text-xs text-slate-500 font-medium">Bullets / Description</label>
                        <Textarea
                            value={item.bullets || ''}
                            onChange={(e) => handleUpdate({ bullets: e.target.value })}
                            placeholder="• Bullet 1&#10;• Bullet 2"
                            className="min-h-[100px] text-sm"
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 mt-1 h-8 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"
                            onClick={handleOptimize}
                            disabled={isOptimizing || !item.bullets}
                        >
                            {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            {isOptimizing ? 'Optimizing...' : 'Optimize Bullets with AI'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
