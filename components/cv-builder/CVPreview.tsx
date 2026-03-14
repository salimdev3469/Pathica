'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useCV, CVState } from '@/context/CVContext';
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

import { X } from 'lucide-react';

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const DEFAULT_PHOTO_SIZE = 112;
const MIN_PHOTO_SIZE = 72;
const MAX_PHOTO_SIZE = 200;

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

// Drag Wrapper for Sections
const DraggableSectionWrapper = ({ id, children, state, showTutorial, onDismiss, isFirst, scale }: { id: string, children: React.ReactNode, state: CVState, showTutorial?: boolean, onDismiss?: () => void, isFirst?: boolean, scale: number }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `section-${id}`,
        data: { type: 'Section', id }
    });

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
                <div
                    {...attributes}
                    {...listeners}
                    className={`absolute -left-[50px] top-1 w-10 flex flex-col items-center justify-start cursor-grab active:cursor-grabbing transition-opacity ${isFirst && showTutorial ? 'opacity-100' : 'opacity-0 group-hover/section:opacity-100'}`}
                    title="Drag to reorder this section"
                >
                    <div className={`bg-slate-800 text-white shadow-md p-1.5 rounded-md transition-colors ${isFirst && showTutorial ? 'animate-bounce shadow-primary/50' : 'hover:bg-slate-700'}`}>
                        <GripVertical size={16} />
                    </div>
                </div>

                {/* Tutorial Balloon - Inside the page pointing left */}
                {isFirst && showTutorial && (
                    <div className="absolute left-[15px] top-1 w-[220px] bg-blue-600 text-white p-4 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in duration-500 font-sans cursor-default pointer-events-none">
                        <div className="flex justify-between items-center mb-1.5 pointer-events-auto">
                            <span className="font-bold text-sm flex items-center gap-1.5">
                                Tip
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); onDismiss?.(); }} className="text-blue-200 hover:text-white transition-colors bg-blue-700/50 hover:bg-blue-700 p-1 rounded-full">
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
const DraggableItemWrapper = ({ id, sectionId, children, scale }: { id: string, sectionId: string, children: React.ReactNode, scale: number }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `item-${id}`,
        data: { type: 'Item', id, sectionId }
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
        <div ref={setNodeRef} style={style} className="group/item rounded p-1 -mx-1 -mt-1 touch-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
            {/* Drag Handle for Item - Top Aligned */}
            <div
                {...attributes}
                {...listeners}
                className="absolute -left-[28px] top-1 cursor-grab active:cursor-grabbing opacity-0 group-hover/item:opacity-100 transition-opacity"
                title="Drag to reorder item"
            >
                <div className="bg-white border text-slate-400 hover:text-slate-600 shadow-sm p-0.5 rounded flex items-center justify-center">
                    <GripVertical size={14} />
                </div>
            </div>
            {children}
        </div>
    );
};

export function CVPreview() {
    const { state, dispatch } = useCV();
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isPhotoDragging, setIsPhotoDragging] = useState(false);
    const [photoDragPosition, setPhotoDragPosition] = useState<{ x: number; y: number } | null>(null);
    const photoDragRef = useRef<{ startClientX: number; startClientY: number; baseX: number; baseY: number } | null>(null);
    const photoDragPositionRef = useRef<{ x: number; y: number } | null>(null);



    const getCurrentPhotoSize = () => {
        return clamp(state.personalInfo?.photoSize ?? DEFAULT_PHOTO_SIZE, MIN_PHOTO_SIZE, MAX_PHOTO_SIZE);
    };

    const getPhotoBounds = (photoSize: number) => ({
        minX: 0,
        maxX: PAGE_WIDTH - photoSize,
        minY: 0,
        maxY: PAGE_HEIGHT - photoSize,
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
        const defaultX = PAGE_WIDTH - size;
        const defaultY = 0;

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
    }, [dispatch, isPhotoDragging, scale, state.personalInfo?.photoDataUrl, state.personalInfo?.photoSize]);

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
            state.personalInfo?.photoX ?? (PAGE_WIDTH - size),
            state.personalInfo?.photoY ?? 0,
            size,
        );

        if (clamped.x !== state.personalInfo?.photoX || clamped.y !== state.personalInfo?.photoY) {
            dispatch({
                type: 'UPDATE_PERSONAL_INFO',
                payload: { photoX: clamped.x, photoY: clamped.y },
            });
        }
    }, [dispatch, state.personalInfo?.photoDataUrl, state.personalInfo?.photoSize]);
    // Auto-scale the A4 preview to fit its container
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



    useEffect(() => {
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
    }, [state.sections.length, showTutorial]);

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
                throw new Error('Failed to generate PDF');
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
            toast.error('Failed to download CV');
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

    const SectionWrapperComponent = React.useCallback(
        ({ id, children }: { id: string, children: React.ReactNode }) => {
            const isFirst = state.sections.length > 0 && state.sections[0].id === id;
            return (
                <DraggableSectionWrapper
                    id={id}
                    state={state}
                    isFirst={isFirst}
                    showTutorial={showTutorial}
                    onDismiss={dismissTutorial}
                    scale={scale}
                >
                    {children}
                </DraggableSectionWrapper>
            );
        },
        [state, showTutorial, scale]
    );

    const ItemWrapperComponent = React.useCallback(
        ({ id, sectionId, children }: { id: string, sectionId: string, children: React.ReactNode }) => {
            return (
                <DraggableItemWrapper
                    id={id}
                    sectionId={sectionId}
                    scale={scale}
                >
                    {children}
                </DraggableItemWrapper>
            );
        },
        [scale]
    );

    return (
        <div className="flex flex-col h-full h-screen sticky top-0">
            <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm z-10">
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
                className="flex-1 bg-slate-200 p-4 pt-12 md:p-8 md:pt-16 overflow-y-auto flex justify-center items-start custom-scrollbar"
            >
                {/* Wrapper to handle scaling */}
                <div style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    marginBottom: `${(1 - scale) * -1123}px` // Adjust bottom margin depending on scale
                }}>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={state.sections.map(s => `section-${s.id}`)} strategy={verticalListSortingStrategy}>
                            <div className="shadow-2xl relative">
                                <CVTemplate
                                    previewMode
                                    cv={state}
                                    SectionWrapper={SectionWrapperComponent}
                                    ItemWrapper={ItemWrapperComponent}
                                    photoPositionOverride={photoDragPosition || undefined}
                                    photoInteractive={
                                        state.personalInfo?.photoDataUrl
                                            ? { onPointerDown: handlePhotoPointerDown, isDragging: isPhotoDragging }
                                            : undefined
                                    }
                                />
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

        </div>
    );
}




