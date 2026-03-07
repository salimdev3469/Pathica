'use client';

import React from 'react';
import { useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function PersonalInfoForm() {
    const { state, dispatch } = useCV();
    const { personalInfo, summary, personalSectionTitle } = state;

    const handleInfoChange = (field: keyof typeof personalInfo, value: string) => {
        dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { [field]: value } });
    };

    return (
        <Card className="mb-6 border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="pb-3 border-b border-primary/10 mb-3">
                <CardTitle className="text-lg flex justify-between text-primary">
                    <Input
                        value={personalSectionTitle || ''}
                        onChange={(e) =>
                            dispatch({ type: 'UPDATE_PERSONAL_SECTION_TITLE', payload: e.target.value })
                        }
                        className="text-lg font-bold bg-transparent border-transparent hover:border-slate-200 focus-visible:ring-1 p-1 h-9 w-full text-primary"
                        placeholder="Section Title"
                    />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                        <Input value={personalInfo?.fullName || ''} onChange={e => handleInfoChange('fullName', e.target.value)} className="bg-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email</label>
                        <Input value={personalInfo?.email || ''} onChange={e => handleInfoChange('email', e.target.value)} className="bg-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Phone</label>
                        <Input value={personalInfo?.phone || ''} onChange={e => handleInfoChange('phone', e.target.value)} className="bg-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Location</label>
                        <Input value={personalInfo?.location || ''} onChange={e => handleInfoChange('location', e.target.value)} className="bg-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">LinkedIn</label>
                        <Input value={personalInfo?.linkedin || ''} onChange={e => handleInfoChange('linkedin', e.target.value)} className="bg-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Portfolio / GitHub</label>
                        <Input value={personalInfo?.portfolio || ''} onChange={e => handleInfoChange('portfolio', e.target.value)} className="bg-white" />
                    </div>
                </div>

                <div className="flex flex-col gap-1 pt-2 border-t border-primary/10 mt-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mt-1">Profile Summary</label>
                    <Textarea
                        value={summary || ''}
                        onChange={e => dispatch({ type: 'UPDATE_SUMMARY', payload: e.target.value })}
                        className="bg-white min-h-[100px]"
                        placeholder="Enter a brief summary..."
                    />
                </div>
            </CardContent>
        </Card>
    );
}
