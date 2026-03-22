'use client';

import React, { useRef, useState, useEffect } from 'react';
import { CVState } from '@/context/CVContext';
import { CVTemplate } from '@/components/pdf/CVTemplate';

export function ReadOnlyViewer({ cvState }: { cvState: CVState }) {
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                // A4 width in px is 794
                const newScale = containerWidth / 794;
                setScale(newScale < 1 ? newScale : 1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="w-full overflow-hidden bg-slate-200 p-2 sm:p-6 md:p-8 flex justify-center custom-scrollbar rounded-xl border border-slate-300 dark:border-slate-700"
        >
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                marginBottom: `${(1 - scale) * -1123}px` // Adjust bottom margin depending on scale
            }}>
                <div className="shadow-2xl bg-white">
                    <CVTemplate
                        previewMode
                        cv={cvState}
                    />
                </div>
            </div>
        </div>
    );
}
