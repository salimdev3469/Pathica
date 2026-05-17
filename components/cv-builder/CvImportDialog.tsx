'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Locale } from '@/lib/locale';
import { useCV } from '@/context/CVContext';
import { applyImportedCvToState, type CvImportMode, type ImportedCvDraft } from '@/lib/cv-import';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CvImportDialogProps = {
  locale?: Locale;
};

type ImportResponse = {
  importedCv?: ImportedCvDraft;
  error?: string;
};

export function CvImportDialog({ locale = 'en' }: CvImportDialogProps) {
  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);
  const { state, dispatch } = useCV();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CvImportMode>('merge');
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const resetFileInput = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && !isImporting) {
      resetFileInput();
      setMode('merge');
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error(t('Please choose a CV file first.', 'Lütfen önce bir CV dosyası seçin.'));
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('locale', locale);

      const response = await fetch('/api/cv/import', {
        method: 'POST',
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as ImportResponse | null;
      if (!response.ok || !payload?.importedCv) {
        throw new Error(payload?.error || t('Could not import CV file.', 'CV dosyası içe aktarılamadı.'));
      }

      const merged = applyImportedCvToState(state, payload.importedCv, mode);
      dispatch({ type: 'SET_CV', payload: merged });

      toast.success(
        mode === 'replace'
          ? t('Imported CV data replaced your current content.', 'İçe aktarılan CV, mevcut içeriğin yerine uygulandı.')
          : t('Imported CV data merged into your current content.', 'İçe aktarılan CV, mevcut içerikle birleştirildi.'),
      );

      setOpen(false);
      resetFileInput();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('An unexpected error occurred during import.', 'İçe aktarma sırasında beklenmeyen bir hata oluştu.');
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 sm:w-auto">
          <Upload className="h-4 w-4" />
          {t('Import CV', 'CV İçe Aktar')}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('Import CV File', 'CV Dosyası İçe Aktar')}</DialogTitle>
          <DialogDescription>
            {t(
              'Upload a PDF, DOC, DOCX, or TXT file. We will extract your data and update this CV.',
              'PDF, DOC, DOCX veya TXT dosyası yükleyin. Bilgiler çıkarılıp bu CV güncellenecek.',
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t('Update Mode', 'Güncelleme Modu')}</label>
            <Select value={mode} onValueChange={(value) => setMode(value as CvImportMode)}>
              <SelectTrigger>
                <SelectValue placeholder={t('Select mode', 'Mod seçin')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merge">
                  {t('Merge with current CV', 'Mevcut CV ile birleştir')}
                </SelectItem>
                <SelectItem value="replace">
                  {t('Replace section contents', 'Bölüm içeriklerini değiştir')}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {mode === 'merge'
                ? t(
                    'Matching sections are updated, unmatched sections are added.',
                    'Eşleşen bölümler güncellenir, eşleşmeyen bölümler eklenir.',
                  )
                : t(
                    'Imported sections replace current sections. Styling settings remain.',
                    'İçe aktarılan bölümler mevcut bölümlerin yerini alır. Stil ayarları korunur.',
                  )}
            </p>
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] || null;
                setFile(nextFile);
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  {file ? file.name : t('No file selected', 'Dosya seçilmedi')}
                </p>
                <p className="text-xs text-slate-500">
                  {file
                    ? `${formatFileSize(file.size)} • ${file.type || t('unknown type', 'bilinmeyen tür')}`
                    : t('Maximum file size: 5MB', 'Maksimum dosya boyutu: 5MB')}
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                {file ? t('Change File', 'Dosyayı Değiştir') : t('Choose File', 'Dosya Seç')}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isImporting}>
            {t('Cancel', 'İptal')}
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !file} className="gap-2">
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {isImporting ? t('Importing...', 'İçe aktarılıyor...') : t('Import and Update', 'İçe Aktar ve Güncelle')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
