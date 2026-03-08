'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { calculateResumeToolScore, extractKeywords } from '@/lib/resume-tools';

type ToolMode = 'ats-checker' | 'resume-analyzer' | 'resume-score' | 'keyword-optimizer';

interface ResumeToolPanelProps {
  mode: ToolMode;
  title: string;
  description: string;
}

export function ResumeToolPanel({ mode, title, description }: ResumeToolPanelProps) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const result = useMemo(() => {
    if (!hasEvaluated) {
      return null;
    }

    return calculateResumeToolScore(resumeText, jobDescriptionText);
  }, [hasEvaluated, resumeText, jobDescriptionText]);

  const optimizedKeywords = useMemo(() => {
    if (!hasEvaluated) {
      return [] as string[];
    }

    const resumeKeywords = new Set(extractKeywords(resumeText));
    return extractKeywords(jobDescriptionText).filter((keyword) => !resumeKeywords.has(keyword)).slice(0, 20);
  }, [hasEvaluated, resumeText, jobDescriptionText]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14 text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-slate-900">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Resume</CardTitle>
              <CardDescription>Paste the current resume content to evaluate.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
                placeholder="Paste your resume text here"
                className="min-h-[260px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Target Job Description</CardTitle>
              <CardDescription>Paste a job posting for keyword and relevance scoring.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescriptionText}
                onChange={(event) => setJobDescriptionText(event.target.value)}
                placeholder="Paste the job description here"
                className="min-h-[260px]"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            className="h-12 rounded-full px-8"
            disabled={!resumeText.trim() || !jobDescriptionText.trim()}
            onClick={() => setHasEvaluated(true)}
          >
            Analyze Resume
          </Button>
        </div>

        {result && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>
                  {mode === 'resume-score' ? 'Resume Score' : mode === 'keyword-optimizer' ? 'Keyword Optimization Result' : 'Analysis Result'}
                </CardTitle>
                <CardDescription>Use these insights to improve your next application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold text-slate-900">{result.score}</span>
                  <span className="pb-1 text-slate-500">/100</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Readability</p>
                    <p className="text-2xl font-semibold text-slate-900">{result.readabilityScore}</p>
                  </div>
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Structure</p>
                    <p className="text-2xl font-semibold text-slate-900">{result.structureScore}</p>
                  </div>
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Keyword Match</p>
                    <p className="text-2xl font-semibold text-slate-900">{result.keywordScore}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Improvement Suggestions</h3>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
                    {result.suggestions.map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{mode === 'keyword-optimizer' ? 'Missing Keywords to Add' : 'Keyword Snapshot'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Matched keywords</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.matchedKeywords.slice(0, 12).map((keyword) => (
                      <span key={keyword} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {keyword}
                      </span>
                    ))}
                    {result.matchedKeywords.length === 0 && <p className="text-sm text-slate-500">No strong match yet.</p>}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Keywords to consider</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(mode === 'keyword-optimizer' ? optimizedKeywords : result.missingKeywords).slice(0, 12).map((keyword) => (
                      <span key={keyword} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </main>
  );
}
