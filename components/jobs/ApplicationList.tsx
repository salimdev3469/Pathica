'use client';

import React, { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Building2, MapPin, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AppProps {
    initialApps: any[];
}

const statusColors: any = {
    applied: 'bg-blue-100 text-blue-800 border-blue-200',
    interviewing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    offer: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: any = {
    applied: <Clock className="w-3 h-3 mr-1" />,
    interviewing: <Calendar className="w-3 h-3 mr-1" />,
    offer: <CheckCircle2 className="w-3 h-3 mr-1" />,
    rejected: <XCircle className="w-3 h-3 mr-1" />,
};

export function ApplicationList({ initialApps }: AppProps) {
    const [apps, setApps] = useState(initialApps);
    const [filter, setFilter] = useState('all');
    const supabase = createBrowserClient();

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update status');

            setApps(apps.map(a => a.id === id ? { ...a, status: newStatus } : a));
            toast.success('Application updated');
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const filteredApps = filter === 'all' ? apps : apps.filter(a => a.status === filter);

    return (
        <div>
            <div className="mb-6 flex justify-end">
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Applications</SelectItem>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4">
                {filteredApps.map(app => (
                    <Card key={app.id} className="w-full">
                        <CardContent className="p-4 sm:p-6 pb-6 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-lg">{app.job_title}</h3>
                                <div className="flex items-center text-slate-500 gap-2 mt-1">
                                    <Building2 className="w-4 h-4" />
                                    <span>{app.company}</span>
                                </div>
                                <div className="text-sm text-slate-400 mt-2">
                                    Applied on {new Date(app.applied_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center border ${statusColors[app.status]}`}>
                                    {statusIcons[app.status]}
                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </div>

                                <Select value={app.status} onValueChange={(val) => handleStatusChange(app.id, val)}>
                                    <SelectTrigger className="w-[140px] h-9">
                                        <SelectValue placeholder="Update status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="applied">Applied</SelectItem>
                                        <SelectItem value="interviewing">Interviewing</SelectItem>
                                        <SelectItem value="offer">Offer</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredApps.length === 0 && (
                    <div className="text-center py-12 text-slate-500 border border-dashed rounded-lg bg-white">
                        No applications match this filter. Start applying to jobs to build your tracker!
                    </div>
                )}
            </div>
        </div>
    );
}
