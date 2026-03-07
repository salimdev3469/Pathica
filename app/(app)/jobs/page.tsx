'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, MapPin, Building2, ExternalLink, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Job {
    id: string;
    title: string;
    company: { display_name: string };
    location: { display_name: string };
    redirect_url: string;
    created: string;
    description: string;
}

export default function JobsPage() {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [matchScores, setMatchScores] = useState<Record<string, { score: number; suggestion: string }>>({});
    const [isScoring, setIsScoring] = useState<Record<string, boolean>>({});
    const [activeCvState, setActiveCvState] = useState<any>(null); // Ideally fetched from context or API

    // Just fetch the latest CV of the user when page loads
    useEffect(() => {
        async function loadLatestCV() {
            // For real app: `/api/cv/latest`
            // Placeholder since we need global context or dedicated API to fetch "Active CV".
            // We will skip actual loading here and rely on the UI button that says "Upload/Select CV to Match" if it was complex.
        }
        loadLatestCV();
    }, []);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`/api/jobs/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to search');

            setJobs(data.results || []);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getMatchScore = async (job: Job) => {
        if (!activeCvState) {
            toast.error("Please ensure you have an active CV saved first.");
            return;
        }

        setIsScoring((prev) => ({ ...prev, [job.id]: true }));
        try {
            const res = await fetch('/api/jobs/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvState: activeCvState, jobDescription: job.description }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMatchScores((prev) => ({ ...prev, [job.id]: data }));
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsScoring((prev) => ({ ...prev, [job.id]: false }));
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-y-auto bg-slate-50">
            <header className="flex h-16 items-center border-b bg-white px-6 w-full justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 font-semibold text-lg text-primary">
                    <Sparkles className="h-6 w-6" />
                    <span>Pro Job Finder</span>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
                <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                    <h1 className="text-2xl font-bold tracking-tight mb-4">Search Jobs & Match CV</h1>
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Job title, keywords, or company..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full text-base"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                placeholder="Location (e.g. London, Remote)"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full text-base"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading} className="md:w-32">
                            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Search'}
                        </Button>
                    </form>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {jobs.map((job) => (
                        <Card key={job.id} className="w-full shadow-sm hover:shadow transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-slate-500 text-sm mb-4">
                                            <div className="flex items-center gap-1">
                                                <Building2 className="h-4 w-4" /> {job.company.display_name}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" /> {job.location.display_name}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                Posted {new Date(job.created).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                            {job.description}
                                        </p>

                                        {matchScores[job.id] && (
                                            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex items-start gap-4">
                                                <div className="flex-shrink-0 flex flex-col items-center justify-center bg-blue-600 text-white rounded-full h-12 w-12 font-bold text-lg">
                                                    {matchScores[job.id].score}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-900">AI Suggestion</p>
                                                    <p className="text-sm text-blue-800 mt-1">{matchScores[job.id].suggestion}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 min-w-[140px]">
                                        <Button
                                            variant="outline"
                                            className="w-full h-10"
                                            onClick={() => getMatchScore(job)}
                                            disabled={isScoring[job.id]}
                                        >
                                            {isScoring[job.id] ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                            Match Score
                                        </Button>
                                        <Button className="w-full h-10" asChild>
                                            <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">
                                                Apply Now <ExternalLink className="h-4 w-4 ml-2" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {jobs.length === 0 && !isLoading && query && (
                        <div className="text-center py-20 text-slate-500">
                            No jobs found. Try adjusting your search criteria.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
