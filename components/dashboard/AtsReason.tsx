'use client';

import { useMemo, useState } from 'react';

type AtsReasonProps = {
    reason: string;
};

const PREVIEW_CHAR_LIMIT = 150;

export default function AtsReason({
    reason
}: AtsReasonProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const trimmedReason = reason.trim();
    const shouldTruncate = trimmedReason.length > PREVIEW_CHAR_LIMIT;

    const previewText = useMemo(() => {
        if (!shouldTruncate) {
            return trimmedReason;
        }
        return `${trimmedReason.slice(0, PREVIEW_CHAR_LIMIT).trimEnd()}...`;
    }, [shouldTruncate, trimmedReason]);

    return (
        <div className="mt-2 text-sm leading-relaxed text-gray-600">
            <p>
                <span className="font-bold text-[#111827]">Tip:</span> {isExpanded || !shouldTruncate ? trimmedReason : previewText}
            </p>
            {shouldTruncate ? (
                <button
                    type="button"
                    onClick={() => setIsExpanded((current) => !current)}
                    className="mt-1 text-xs font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700"
                >
                    {isExpanded ? 'Show less' : 'Show more'}
                </button>
            ) : null}
        </div>
    );
}
