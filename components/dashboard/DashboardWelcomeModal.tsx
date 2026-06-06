'use client';;
import { useEffect, useState } from 'react';
import { X, Wand2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardWelcomeModal({}: {}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('pathica_dashboard_welcome_v1');
    if (!hasSeen) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem('pathica_dashboard_welcome_v1', 'true');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleFinish} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[#05070b] text-white shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        <div className="p-8 sm:p-10">
          <div className="flex justify-end mb-6">
            <button onClick={handleFinish} className="rounded-full bg-white/5 p-2 text-white/50 hover:bg-white/10 hover:text-white transition">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            {'Welcome to Pathica!'}
          </h2>
          <p className="mb-8 text-base leading-relaxed text-white/60">
            {'We are thrilled to have you here. Pathica helps you build ATS-friendly resumes and provides AI-powered reviews to boost your interview chances.'}
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Button asChild className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition">
              <Link href="/cv/new" onClick={handleFinish}>
                <FileText className="mr-2 h-5 w-5" />
                {'Create CV'}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 w-full rounded-xl border-white/10 bg-white/5 font-semibold text-white hover:bg-white/10 hover:border-white/20 hover:text-white transition">
              <Link href="/dashboard/ai-review" onClick={handleFinish}>
                <Wand2 className="mr-2 h-5 w-5 text-purple-400" />
                {'Try AI Review'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
