'use client';

import React, { useState } from 'react';
import { Field, useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FieldItemProps {
    sectionId: string;
    field: Field;
}

export function FieldItem({ sectionId, field }: FieldItemProps) {
    const { dispatch } = useCV();

    const [isOptimizing, setIsOptimizing] = useState(false);

    const handleUpdate = (updates: Partial<Field>) => {
        dispatch({
            type: 'UPDATE_FIELD',
            payload: { sectionId, fieldId: field.id, updates },
        });
    };

    const handleRemove = () => {
        dispatch({ type: 'REMOVE_FIELD', payload: { sectionId, fieldId: field.id } });
    };

    const handleOptimize = async () => {
        if (!field.value) return;
        setIsOptimizing(true);
        try {
            const res = await fetch('/api/cv/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: field.value, label: field.label }),
            });
            if (!res.ok) throw new Error('Failed to optimize');
            const data = await res.json();
            handleUpdate({ value: data.optimizedText });
            toast.success('Text optimized successfully!');
        } catch (error) {
            toast.error('Geliştirme sağlanamadı. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setIsOptimizing(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 p-3 bg-slate-50 border rounded-md group">
            <div className="flex justify-between items-center gap-2">
                <Input
                    value={field.label}
                    onChange={(e) => handleUpdate({ label: e.target.value })}
                    className="font-medium bg-transparent border-transparent focus-visible:ring-1 focus-visible:border-input px-1 py-0 h-7 w-1/2"
                    placeholder="Field Label (e.g., Job Title)"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemove}
                >
                    <Trash2 size={16} />
                </Button>
            </div>

            <div className="mt-1">
                {field.fieldType === 'textarea' ? (
                    <div className="flex flex-col gap-1">
                        <Textarea
                            value={field.value}
                            onChange={(e) => handleUpdate({ value: e.target.value })}
                            placeholder={`Enter ${field.label}...`}
                            className="text-sm min-h-[80px]"
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 mt-1 h-8 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 border border-indigo-200 transition-colors"
                            onClick={handleOptimize}
                            disabled={isOptimizing || !field.value}
                        >
                            {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            {isOptimizing ? 'Optimizing...' : 'Optimize with AI'}
                        </Button>
                    </div>
                ) : (
                    <Input
                        type={field.fieldType === 'date' ? 'month' : field.fieldType === 'url' ? 'url' : 'text'}
                        value={field.value}
                        onChange={(e) => handleUpdate({ value: e.target.value })}
                        placeholder={`Enter ${field.label}...`}
                        className="text-sm"
                    />
                )}
            </div>

            <div className="flex gap-2 text-xs text-slate-400 mt-1">
                <span>Type:</span>
                <select
                    title="Field Type"
                    value={field.fieldType}
                    onChange={(e) => handleUpdate({ fieldType: e.target.value as any })}
                    className="bg-transparent outline-none cursor-pointer hover:text-slate-600"
                >
                    <option value="text">Text</option>
                    <option value="date">Date</option>
                    <option value="url">URL</option>
                    <option value="textarea">Textarea</option>
                </select>
            </div>
        </div>
    );
}
