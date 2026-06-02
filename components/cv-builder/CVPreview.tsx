'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useCV } from '@/context/CVContext';
import { CVTemplate } from '@/components/pdf/CVTemplate';
import { Button } from '@/components/ui/button';
import { Download, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { X } from 'lucide-react';
import { CV_PAGE_HEIGHT_PX, CV_PAGE_WIDTH_PX, normalizeCvPageMargins } from '@/lib/cv-layout';

type PreviewContextValue = {
    scale: number;
    showTutorial: boolean;
    dismissTutorial: () => void;
    dragEnabled: boolean;
};

export const PreviewContext = React.createContext<PreviewContextValue>({
    scale: 1,
    showTutorial: false,
    dismissTutorial: () => { },
    dragEnabled: true,
});

const DEFAULT_PHOTO_SIZE = 112;
const MIN_PHOTO_SIZE = 72;
const MAX_PHOTO_SIZE = 200;

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

// Drag Wrapper for Sections
const DraggableSectionWrapper = ({ id, children, isContinuation }: { id: string, children: React.ReactNode, isContinuation?: boolean }) => {
    const { state } = useCV();
    const { scale, showTutorial, dismissTutorial, dragEnabled } = React.useContext(PreviewContext);
    
    // Only make it sortable if it's not a continuation
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `section-${id}`,
        data: { type: 'Section', id },
        disabled: isContinuation || !dragEnabled
    });

    const isFirst = state.sections.length > 0 && state.sections[0].id === id;

    const section = state.sections.find(s => s.id === id);
    if (!section) return <div style={{ marginBottom: '14px' }}>{children}</div>;

    // Compensate for the A4 page CSS scale by inverse scaling the drag offset
    const scaledTransform = transform ? {
        ...transform,
        x: transform.x / scale,
        y: transform.y / scale,
    } : null;

    const style = {
        transform: CSS.Translate.toString(scaledTransform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        marginBottom: '14px',
        position: 'relative' as const,
        zIndex: isDragging ? 50 : (isFirst && showTutorial ? 30 : 1),
        ...(isDragging && {
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
            backgroundColor: '#ffffff',
            borderRadius: '6px'
        })
    };

    return (
        <SortableContext items={(section.items || []).map(i => `item-${i.id}`)} strategy={verticalListSortingStrategy}>
            <div ref={setNodeRef} style={style} className={`group/section ${isFirst && showTutorial ? 'ring-2 ring-primary/50 ring-offset-4 rounded-md' : ''}`}>
                {/* Drag Handle for Section - Top Aligned to avoid overlapping with items */}
                {!isContinuation && dragEnabled && (
                    <div
                        {...attributes}
                        {...listeners}
                        className={`absolute -left-[50px] top-1 w-10 flex flex-col items-center justify-start cursor-grab active:cursor-grabbing transition-opacity ${isFirst && showTutorial ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover/section:opacity-100'}`}
                        title="Drag to reorder this section"
                    >
                        <div className={`bg-slate-800 text-white shadow-md p-1.5 rounded-md transition-colors ${isFirst && showTutorial ? 'animate-bounce shadow-primary/50' : 'hover:bg-slate-700'}`}>
                            <GripVertical size={16} />
                        </div>
                    </div>
                )}

                {/* Tutorial Balloon - Inside the page pointing left */}
                {isFirst && showTutorial && (
                    <div className="absolute left-[15px] top-1 w-[220px] bg-blue-600 text-white p-4 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in duration-500 font-sans cursor-default pointer-events-none">
                        <div className="flex justify-between items-center mb-1.5 pointer-events-auto">
                            <span className="font-bold text-sm flex items-center gap-1.5">
                                Tip
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); dismissTutorial(); }} className="text-blue-200 hover:text-white transition-colors bg-blue-700/50 hover:bg-blue-700 p-1 rounded-full">
                                <X size={14} />
                            </button>
                        </div>
                        <p className="text-[13px] leading-relaxed text-blue-50">
                            You can completely change the layout by <strong>grabbing and dragging</strong> objects from here!
                        </p>
                        {/* Left pointing tail */}
                        <div className="absolute top-4 -left-[6px] w-0 h-0 border-y-[8px] border-y-transparent border-r-[10px] border-r-blue-600"></div>
                    </div>
                )}

                {children}
            </div>
        </SortableContext>
    );
};

// Drag Wrapper for Items (Sub-Sections)
const DraggableItemWrapper = ({ id, sectionId, children }: { id: string, sectionId: string, children: React.ReactNode }) => {
    const { scale, dragEnabled } = React.useContext(PreviewContext);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `item-${id}`,
        data: { type: 'Item', id, sectionId },
        disabled: !dragEnabled,
    });

    const scaledTransform = transform ? {
        ...transform,
        x: transform.x / scale,
        y: transform.y / scale,
    } : null;

    const style = {
        transform: CSS.Translate.toString(scaledTransform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 40 : 1,
        ...(isDragging && {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            margin: '-2px -4px',
            padding: '2px 4px'
        })
    };

    return (
        <div ref={setNodeRef} style={style} className="group/item rounded p-1 -mx-1 -mt-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
            {/* Drag Handle for Item - Top Aligned */}
            {dragEnabled && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute -left-[28px] top-1 cursor-grab active:cursor-grabbing opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-opacity"
                    title="Drag to reorder item"
                >
                    <div className="bg-white border text-slate-400 hover:text-slate-600 shadow-sm p-0.5 rounded flex items-center justify-center">
                        <GripVertical size={14} />
                    </div>
                </div>
            )}
            {children}
        </div>
    );
};

export function CVPreview() {
    const { state, dispatch } = useCV();
    const pageMargins = normalizeCvPageMargins(state.pageMargins);
    const [scale, setScale] = useState(1);
    const [dragEnabled, setDragEnabled] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const previewContentRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isPhotoDragging, setIsPhotoDragging] = useState(false);
    const [photoDragPosition, setPhotoDragPosition] = useState<{ x: number; y: number } | null>(null);
    const [previewContentHeight, setPreviewContentHeight] = useState(CV_PAGE_HEIGHT_PX);
    const photoDragRef = useRef<{ startClientX: number; startClientY: number; baseX: number; baseY: number } | null>(null);
    const photoDragPositionRef = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(pointer: coarse)');
        const syncDragMode = () => setDragEnabled(!mediaQuery.matches);
        syncDragMode();

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', syncDragMode);
            return () => mediaQuery.removeEventListener('change', syncDragMode);
        }

        mediaQuery.addListener(syncDragMode);
        return () => mediaQuery.removeListener(syncDragMode);
    }, []);



    const getCurrentPhotoSize = () => {
        return clamp(state.personalInfo?.photoSize ?? DEFAULT_PHOTO_SIZE, MIN_PHOTO_SIZE, MAX_PHOTO_SIZE);
    };

    const getPhotoBounds = (photoSize: number) => ({
        minX: pageMargins.left,
        maxX: CV_PAGE_WIDTH_PX - pageMargins.right - photoSize,
        minY: pageMargins.top,
        maxY: CV_PAGE_HEIGHT_PX - pageMargins.bottom - photoSize,
    });

    const clampPhotoPosition = (x: number, y: number, photoSize: number) => {
        const bounds = getPhotoBounds(photoSize);
        return {
            x: clamp(x, bounds.minX, bounds.maxX),
            y: clamp(y, bounds.minY, bounds.maxY),
        };
    };

    const getCurrentPhotoPosition = () => {
        const size = getCurrentPhotoSize();
        const defaultX = CV_PAGE_WIDTH_PX - pageMargins.right - size;
        const defaultY = pageMargins.top;

        return clampPhotoPosition(
            state.personalInfo?.photoX ?? defaultX,
            state.personalInfo?.photoY ?? defaultY,
            size,
        );
    };

    const handlePhotoPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!state.personalInfo?.photoDataUrl) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const current = photoDragPosition ?? getCurrentPhotoPosition();

        photoDragRef.current = {
            startClientX: event.clientX,
            startClientY: event.clientY,
            baseX: current.x,
            baseY: current.y,
        };
        photoDragPositionRef.current = current;
        setPhotoDragPosition(current);
        setIsPhotoDragging(true);
    };

    useEffect(() => {
        if (!isPhotoDragging) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const drag = photoDragRef.current;
            if (!drag) return;

            const photoSize = getCurrentPhotoSize();
            const scaleSafe = scale > 0 ? scale : 1;
            const deltaX = (event.clientX - drag.startClientX) / scaleSafe;
            const deltaY = (event.clientY - drag.startClientY) / scaleSafe;
            const next = clampPhotoPosition(drag.baseX + deltaX, drag.baseY + deltaY, photoSize);
            const rounded = { x: Math.round(next.x), y: Math.round(next.y) };

            photoDragPositionRef.current = rounded;
            setPhotoDragPosition(rounded);
        };

        const finishDragging = () => {
            const finalPosition = photoDragPositionRef.current;
            if (finalPosition && state.personalInfo?.photoDataUrl) {
                dispatch({
                    type: 'UPDATE_PERSONAL_INFO',
                    payload: { photoX: finalPosition.x, photoY: finalPosition.y },
                });
            }

            setIsPhotoDragging(false);
            setPhotoDragPosition(null);
            photoDragRef.current = null;
            photoDragPositionRef.current = null;
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', finishDragging);
        window.addEventListener('pointercancel', finishDragging);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', finishDragging);
            window.removeEventListener('pointercancel', finishDragging);
        };
    }, [dispatch, isPhotoDragging, pageMargins.bottom, pageMargins.left, pageMargins.right, pageMargins.top, scale, state.personalInfo?.photoDataUrl, state.personalInfo?.photoSize]);

    useEffect(() => {
        if (!state.personalInfo?.photoDataUrl) {
            setIsPhotoDragging(false);
            setPhotoDragPosition(null);
            photoDragRef.current = null;
            photoDragPositionRef.current = null;
            return;
        }

        const size = getCurrentPhotoSize();
        const clamped = clampPhotoPosition(
            state.personalInfo?.photoX ?? (CV_PAGE_WIDTH_PX - pageMargins.right - size),
            state.personalInfo?.photoY ?? pageMargins.top,
            size,
        );

        if (clamped.x !== state.personalInfo?.photoX || clamped.y !== state.personalInfo?.photoY) {
            dispatch({
                type: 'UPDATE_PERSONAL_INFO',
                payload: { photoX: clamped.x, photoY: clamped.y },
            });
        }
    }, [dispatch, pageMargins.bottom, pageMargins.left, pageMargins.right, pageMargins.top, state.personalInfo?.photoDataUrl, state.personalInfo?.photoSize]);

    useEffect(() => {
        const content = previewContentRef.current;
        if (!content) {
            return;
        }

        const updateContentHeight = () => {
            const nextHeight = Math.max(CV_PAGE_HEIGHT_PX, content.offsetHeight);
            setPreviewContentHeight(nextHeight);
        };

        updateContentHeight();

        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        const observer = new ResizeObserver(() => updateContentHeight());
        observer.observe(content);
        return () => observer.disconnect();
    }, [state]);
    // Auto-scale the A4 preview to fit its container
    useEffect(() => {
        const updateScale = () => {
            const container = containerRef.current;
            if (!container) return;

            const containerWidth = container.clientWidth;
            if (containerWidth <= 0) return;

            // A4 width in px is 794
            const newScale = containerWidth / CV_PAGE_WIDTH_PX;
            setScale(newScale < 1 ? newScale : 1);
        };

        updateScale();

        const container = containerRef.current;
        let resizeObserver: ResizeObserver | null = null;

        if (container && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => updateScale());
            resizeObserver.observe(container);
        }

        window.addEventListener('resize', updateScale);
        return () => {
            window.removeEventListener('resize', updateScale);
            resizeObserver?.disconnect();
        };
    }, []);



    useEffect(() => {
        if (!dragEnabled) {
            if (showTutorial) {
                setShowTutorial(false);
            }
            return;
        }

        // Show tutorial if not seen before and there are sections
        const seen = localStorage.getItem('cv-builder-dnd-tutorial-v2');
        if (!seen && state.sections.length > 0 && !showTutorial) {
            setShowTutorial(true);
            // Show the drag-and-drop onboarding toast shortly after the tutorial appears
            setTimeout(() => {
                toast('New Feature: Drag & Drop', {
                    description: 'You can instantly reorder your CV by grabbing the drag handles on the left side of the sections on the PDF preview!',
                    duration: 10000,
                    action: {
                        label: 'Got it',
                        onClick: () => dismissTutorial(),
                    },
                });
            }, 800);
        }
    }, [dragEnabled, state.sections.length, showTutorial]);

    const dismissTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem('cv-builder-dnd-tutorial-v2', 'true');
    };

    const downloadPdfDirectly = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch('/api/cv/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to generate PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            let filename = 'CV';
            if (state.personalInfo?.fullName) {
                filename = state.personalInfo.fullName.replace(/\s+/g, '_');
            }
            a.download = `${filename}_CV.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success('CV downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            const msg = error instanceof Error ? error.message : 'Failed to download CV';
            toast.error(msg);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownload = async () => {
        await downloadPdfDirectly();
    };

    // DND Handlers
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        if (showTutorial) dismissTutorial();

        const { active, over } = event;
        if (!over) return;

        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;

        if (active.data.current?.type === 'Section' && over.data.current?.type === 'Section') {
            if (activeIdStr !== overIdStr) {
                const oldIndex = state.sections.findIndex(s => `section-${s.id}` === activeIdStr);
                const newIndex = state.sections.findIndex(s => `section-${s.id}` === overIdStr);
                const newSections = arrayMove(state.sections, oldIndex, newIndex);
                dispatch({ type: 'REORDER_SECTIONS', payload: newSections });
            }
        }
        else if (active.data.current?.type === 'Item' && over.data.current?.type === 'Item') {
            if (activeIdStr !== overIdStr) {
                const sectionId = active.data.current.sectionId;
                const section = state.sections.find(s => s.id === sectionId);
                if (section) {
                    const oldIndex = section.items.findIndex(i => `item-${i.id}` === activeIdStr);
                    const newIndex = section.items.findIndex(i => `item-${i.id}` === overIdStr);
                    const newItems = arrayMove(section.items, oldIndex, newIndex);
                    dispatch({ type: 'REORDER_ITEMS', payload: { sectionId, items: newItems } });
                }
            }
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="z-10 flex items-center justify-between border-b bg-white p-4 shadow-sm">
                <h2 className="font-semibold text-lg text-slate-800">Preview</h2>
                <div className="flex gap-2">

                    <Button onClick={handleDownload} disabled={isDownloading} className="gap-2">
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Download PDF
                    </Button>
                </div>
            </div>

            <div
                ref={containerRef}
                className="custom-scrollbar flex flex-1 items-start justify-center overflow-y-auto overscroll-y-contain bg-slate-200 p-4 pt-12 md:min-h-0 md:p-8 md:pt-16"
            >
                {/* Wrapper to handle scaling */}
                <div style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    marginBottom: `${(1 - scale) * -previewContentHeight}px`
                }}>
                    <div ref={previewContentRef}>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis]}
                        >
                            <SortableContext items={state.sections.map(s => `section-${s.id}`)} strategy={verticalListSortingStrategy}>
                                <PreviewContext.Provider value={{ scale, showTutorial, dismissTutorial, dragEnabled }}>
                                    <div className="shadow-2xl relative">
                                        <CVTemplate
                                            previewMode
                                            cv={state}
                                            SectionWrapper={DraggableSectionWrapper}
                                            ItemWrapper={DraggableItemWrapper}
                                            photoPositionOverride={photoDragPosition || undefined}
                                            photoInteractive={
                                                state.personalInfo?.photoDataUrl
                                                    ? { onPointerDown: handlePhotoPointerDown, isDragging: isPhotoDragging }
                                                    : undefined
                                            }
                                        />
                                    </div>
                                </PreviewContext.Provider>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </div>

        </div>
    );
}
