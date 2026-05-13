'use client';

import { useMemo, useState } from 'react';

type AtsReasonProps = {
    reason: string;
    locale: string;
};

const PREVIEW_CHAR_LIMIT = 150;

export default function AtsReason({ reason, locale }: AtsReasonProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isTr = locale === 'tr';
    const t = (en: string, tr: string) => (isTr ? tr : en);

    const trimmedReason = reason.trim();
    const shouldTruncate = trimmedReason.length > PREVIEW_CHAR_LIMIT;

    const previewText = useMemo(() => {
        if (!shouldTruncate) {
            return trimmedReason;
        }
        return `${trimmedReason.slice(0, PREVIEW_CHAR_LIMIT).trimEnd()}...`;
    }, [shouldTruncate, trimmedReason]);

    return (
        <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            <p>
                {t('Why', 'Neden')}: {isExpanded || !shouldTruncate ? trimmedReason : previewText}
            </p>
            {shouldTruncate ? (
                <button
                    type="button"
                    onClick={() => setIsExpanded((current) => !current)}
                    className="mt-1 text-xs font-semibold text-slate-700 underline underline-offset-2 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                >
                    {isExpanded ? t('Show less', 'Daha az göster') : t('Show more', 'Daha fazla göster')}
                </button>
            ) : null}
        </div>
    );
}
