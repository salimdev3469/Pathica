'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type FaqAccordionItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: ReadonlyArray<FaqAccordionItem>;
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(items.length > 0 ? 0 : null);

  return (
    <div className="grid gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `faq-button-${index}`;
        const panelId = `faq-panel-${index}`;

        return (
          <div
            key={item.question}
            className={cn(
              'rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)] transition-colors dark:border-slate-800 dark:bg-slate-900/80',
              isOpen && 'border-blue-200 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-500/5',
            )}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold tracking-[-0.02em] text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-slate-50 dark:focus-visible:ring-offset-slate-950 sm:px-6 sm:text-lg"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-slate-500 transition-transform dark:text-slate-400',
                    isOpen && 'rotate-180 text-blue-600 dark:text-blue-300',
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-5 pb-5 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:px-6"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
