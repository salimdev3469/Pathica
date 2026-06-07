'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { applyImportedCvToState } from '@/lib/cv-import';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DashboardImportCvButtonProps = {
  className?: string;
  locale?: string;
};

export default function DashboardImportCvButton({ className, locale = 'en' }: DashboardImportCvButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const importRes = await fetch('/api/cv/import', { method: 'POST', body: formData });
      const importData = await importRes.json();
      if (!importRes.ok || !importData.importedCv) {
        throw new Error(importData.error || 'Failed to extract CV data.');
      }

      const shellRes = await fetch('/api/cv/create-shell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: importData.importedCv.title || 'Imported CV' }),
      });
      const shellData = await shellRes.json();
      if (!shellRes.ok || !shellData.cvId) {
        throw new Error(shellData.error || 'Could not create a new CV shell.');
      }

      const blankState = {
        id: shellData.cvId,
        title: importData.importedCv.title || 'Imported CV',
        personalInfo: { 
            fullName: '', 
            jobTitle: '', 
            email: '', 
            phone: '', 
            location: '', 
            linkedin: '', 
            portfolio: '', 
            github: '' 
        },
        summaryTitle: 'Profile Summary',
        summary: '',
        sections: [],
      };

      const newState = applyImportedCvToState(blankState as any, importData.importedCv, 'replace');

      const savePayload = {
        ...newState,
        fontFamily: 'calibri',
        letterSpacing: 0,
      };

      const saveRes = await fetch('/api/cv/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savePayload),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save the imported data.');
      }

      toast.success('CV imported successfully!');
      router.push(`/cv/${shellData.cvId}?imported=1`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error importing CV.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
        onChange={handleFileChange} 
      />
      <Button 
        variant="outline" 
        className={cn(
          'h-12 gap-2 rounded-xl border border-gray-200 bg-white px-6 text-[#111827] font-semibold hover:bg-slate-50 transition shadow-sm',
          className
        )} 
        onClick={() => fileInputRef.current?.click()} 
        disabled={isImporting}
      >
        {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {isImporting ? 'Importing...' : 'Import CV'}
      </Button>
    </>
  );
}
