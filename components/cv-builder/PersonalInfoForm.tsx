'use client';

import React, { useRef } from 'react';
import { toast } from 'sonner';
import type { Locale } from '@/lib/locale';
import { useCV } from '@/context/CVContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type PersonalInfoFormProps = {
  locale?: Locale;
};

const DEFAULT_PHOTO_X = 628;
const DEFAULT_PHOTO_Y = 54;
const DEFAULT_PHOTO_SIZE = 112;
const MIN_PHOTO_SIZE = 72;
const MAX_PHOTO_SIZE = 200;

export function PersonalInfoForm({ locale = 'en' }: PersonalInfoFormProps) {
  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { state, dispatch } = useCV();
  const { personalInfo, summary, summaryTitle } = state;

  const handleInfoChange = <K extends keyof typeof personalInfo>(field: K, value: (typeof personalInfo)[K]) => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { [field]: value } as Partial<typeof personalInfo> });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('Please select an image file.', 'Lutfen bir gorsel dosyasi secin.'));
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error(t('Image must be smaller than 3MB.', 'Gorsel 3MB altinda olmali.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;

      dispatch({
        type: 'UPDATE_PERSONAL_INFO',
        payload: {
          photoDataUrl: result,
          photoX: typeof personalInfo?.photoX === 'number' ? personalInfo.photoX : DEFAULT_PHOTO_X,
          photoY: typeof personalInfo?.photoY === 'number' ? personalInfo.photoY : DEFAULT_PHOTO_Y,
          photoSize: typeof personalInfo?.photoSize === 'number' ? personalInfo.photoSize : DEFAULT_PHOTO_SIZE,
        },
      });

      toast.success(t('Photo uploaded. You can drag it in preview.', 'Fotograf yuklendi. Onizlemede surukleyebilirsin.'));
    };

    reader.readAsDataURL(file);
  };

  const handlePhotoSizeChange = (value: number) => {
    const nextSize = Math.max(MIN_PHOTO_SIZE, Math.min(MAX_PHOTO_SIZE, value));
    dispatch({
      type: 'UPDATE_PERSONAL_INFO',
      payload: {
        photoSize: nextSize,
      },
    });
  };

  const handleRemovePhoto = () => {
    dispatch({
      type: 'UPDATE_PERSONAL_INFO',
      payload: {
        photoDataUrl: '',
        photoX: DEFAULT_PHOTO_X,
        photoY: DEFAULT_PHOTO_Y,
        photoSize: DEFAULT_PHOTO_SIZE,
      },
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="mb-3 border-b border-primary/10 pb-3">
        <CardTitle className="flex justify-between text-lg text-primary">{t('Personal Information & Summary', 'Kisisel Bilgiler ve Ozet')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="pl-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('Full Name', 'Ad Soyad')}</label>
            <Input value={personalInfo?.fullName || ''} onChange={(e) => handleInfoChange('fullName', e.target.value)} className="bg-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="pl-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</label>
            <Input value={personalInfo?.email || ''} onChange={(e) => handleInfoChange('email', e.target.value)} className="bg-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="pl-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('Phone', 'Telefon')}</label>
            <Input value={personalInfo?.phone || ''} onChange={(e) => handleInfoChange('phone', e.target.value)} className="bg-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="pl-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('Location', 'Konum')}</label>
            <Input value={personalInfo?.location || ''} onChange={(e) => handleInfoChange('location', e.target.value)} className="bg-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="pl-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">LinkedIn</label>
            <Input value={personalInfo?.linkedin || ''} onChange={(e) => handleInfoChange('linkedin', e.target.value)} className="bg-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="pl-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('Portfolio / GitHub', 'Portfolyo / GitHub')}</label>
            <Input value={personalInfo?.portfolio || ''} onChange={(e) => handleInfoChange('portfolio', e.target.value)} className="bg-white" />
          </div>
        </div>

        <div className="rounded-md border border-primary/20 bg-white/70 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">{t('Profile Photo', 'Profil Fotografi')}</p>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                {personalInfo?.photoDataUrl ? t('Change Photo', 'Fotografi Degistir') : t('Upload Photo', 'Fotograf Yukle')}
              </Button>
              {personalInfo?.photoDataUrl && (
                <Button type="button" size="sm" variant="ghost" onClick={handleRemovePhoto}>
                  {t('Remove', 'Kaldir')}
                </Button>
              )}
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

          {personalInfo?.photoDataUrl && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{t('Photo Size', 'Fotograf Boyutu')}</span>
                <span>{Math.round(personalInfo?.photoSize || DEFAULT_PHOTO_SIZE)} px</span>
              </div>
              <input
                type="range"
                min={MIN_PHOTO_SIZE}
                max={MAX_PHOTO_SIZE}
                step={2}
                value={Math.round(personalInfo?.photoSize || DEFAULT_PHOTO_SIZE)}
                onChange={(e) => handlePhotoSizeChange(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          )}

          <p className="text-xs text-slate-500">
            {t('Default position is top-right. Drag in preview to move and resize with the slider.', 'Varsayilan konum sag ust. Tasimak icin onizlemede surukle, boyut icin kaydiriciyi kullan.')}
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-1 border-t border-primary/10 pt-2">
          <label className="mt-1 pl-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('Summary Title', 'Ozet Basligi')}</label>
          <Input
            value={summaryTitle || ''}
            onChange={(e) => dispatch({ type: 'UPDATE_SUMMARY_TITLE', payload: e.target.value })}
            className="bg-white"
            placeholder={t('e.g. Profile Summary', 'Orn. Profil Ozeti')}
          />
          <label className="mt-2 pl-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('Summary Content', 'Ozet Icerigi')}</label>
          <Textarea
            value={summary || ''}
            onChange={(e) => dispatch({ type: 'UPDATE_SUMMARY', payload: e.target.value })}
            className="min-h-[100px] bg-white"
            placeholder={t('Enter a brief summary...', 'Kisa bir ozet girin...')}
          />
        </div>
      </CardContent>
    </Card>
  );
}