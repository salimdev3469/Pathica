import { CVProvider } from '@/context/CVContext';
import { CVBuilder } from '@/components/cv-builder/CVBuilder';
import { CVPreview } from '@/components/cv-builder/CVPreview';
import { cookies } from 'next/headers';
import { CVState } from '@/context/CVContext';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { normalizeCvFont } from '@/lib/cv-fonts';

export default function GuestCVPage() {
    const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);

    // Provide default empty state for guest users
    const initialState: CVState = {
        id: 'guest-cv',
        title: locale === 'tr' ? 'Başlıksız CV' : 'Untitled CV',
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            portfolio: '',
            github: '',
        },
        summaryTitle: locale === 'tr' ? 'Profil Özeti' : 'Profile Summary',
        summary: '',
        fontFamily: normalizeCvFont(undefined),
        sections: [],
    };

    return (
        <CVProvider initialState={initialState}>
            <div className="flex flex-col bg-slate-50 md:h-screen md:flex-row md:overflow-hidden">
                {/* Left side: Builder */}
                <div className="relative flex w-full flex-col border-b md:h-full md:w-1/2 md:border-b-0 md:border-r bg-slate-50">
                    <div className="absolute left-0 top-0 z-50 h-1 w-full bg-gradient-to-r from-primary to-blue-500 md:rounded-none"></div>
                    <CVBuilder locale={locale} />
                </div>

                {/* Right side: Preview */}
                <div id="preview-section" className="relative z-0 min-h-screen w-full bg-slate-200 shadow-inner md:h-full md:w-1/2">
                    <CVPreview />
                </div>
            </div>
        </CVProvider>
    );
}
