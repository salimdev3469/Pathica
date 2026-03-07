'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useCV, CVState } from '@/context/CVContext';
import { CVTemplate } from '@/components/pdf/CVTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Loader2, Sparkles, UserPlus, Save, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useAnonymousLimit } from '@/hooks/useAnonymousLimit';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';

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
        <div ref={setNodeRef} style={style} className="group/item hover:bg-slate-50 transition-colors rounded p-1 -mx-1 -mt-1 touch-none">
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
    const [isSaving, setIsSaving] = useState(false);
    const { fingerprint, hasReachedLimit, isLoading, setHasReachedLimit } = useAnonymousLimit();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [downloadEmail, setDownloadEmail] = useState('');
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);


    const getErrorMessage = (error: unknown) => {
        if (error instanceof Error) return error.message;
        return 'Unexpected error';
    };
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
        let isMounted = true;

        async function loadAuthState() {
            try {
                const supabase = createBrowserClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (isMounted) {
                    setIsAuthenticated(Boolean(user));
                }
            } catch {
                if (isMounted) setIsAuthenticated(false);
            }
        }

        loadAuthState();

        return () => {
            isMounted = false;
        };
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/cv/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save');
            }
            toast.success('CV saved successfully!');
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(error.message || 'Failed to save CV. Please ensure you are logged in.');
        } finally {
            setIsSaving(false);
        }
    };

    const downloadPdfDirectly = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch('/api/cv/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...state, fingerprint: isAuthenticated ? undefined : fingerprint }),
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
            if (!isAuthenticated) {
                setHasReachedLimit(true);
            }
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download CV');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleEmailRequest = async () => {
        const trimmedEmail = downloadEmail.trim();
        if (!trimmedEmail) {
            toast.error('Please enter an email address.');
            return;
        }

        if (!fingerprint) {
            toast.error('Could not verify your device. Please refresh and try again.');
            return;
        }

        setIsSubmittingEmail(true);
        try {
            const response = await fetch('/api/cv/email/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: trimmedEmail,
                    cvState: state,
                    fingerprint,
                }),
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to send verification email');
            }

            setShowEmailDialog(false);
            setDownloadEmail('');
            toast.success('Verification email sent. After confirmation, your CV will be sent to your inbox.');
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsSubmittingEmail(false);
        }
    };

    const handleDownload = async () => {
        if (isAuthenticated) {
            await downloadPdfDirectly();
            return;
        }

        if (!fingerprint) {
            toast.error('Could not verify your device. Please refresh and try again.');
            return;
        }

        if (hasReachedLimit) {
            setShowUpgradeModal(true);
            return;
        }

        setShowEmailDialog(true);
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
                    {isAuthenticated && (
                        <Button variant="outline" onClick={handleSave} disabled={isSaving} className="gap-2">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                        </Button>
                    )}
                    <Button onClick={handleDownload} disabled={isDownloading || isLoading || isSubmittingEmail} className="gap-2">
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isAuthenticated ? 'Download PDF' : 'Send PDF to Email'}
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
                                    cv={state}
                                    SectionWrapper={SectionWrapperComponent}
                                    ItemWrapper={ItemWrapperComponent}
                                />
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center pb-2">Where should we send your CV?</DialogTitle>
                        <DialogDescription className="text-center text-base">
                            Enter your email to verify it. After confirmation, your CV will be sent to your inbox.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="download-email">Email address</Label>
                        <Input
                            id="download-email"
                            type="email"
                            placeholder="you@example.com"
                            value={downloadEmail}
                            onChange={(e) => setDownloadEmail(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={isSubmittingEmail}>
                            Cancel
                        </Button>
                        <Button onClick={handleEmailRequest} disabled={isSubmittingEmail} className="gap-2">
                            {isSubmittingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                            Send verification email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center pb-2">You've used your free CV</DialogTitle>
                        <DialogDescription className="text-center text-base">
                            Sign up free to save your CV, or go Pro to unlock AI optimization and job matching.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-4">
                        <Button asChild variant="outline" className="w-full text-lg h-12">
                            <Link href="/register">
                                <UserPlus className="mr-2 h-5 w-5" />
                                Create Free Account
                            </Link>
                        </Button>
                        <Button asChild className="w-full text-lg h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md">
                            <Link href="/api/stripe/checkout">
                                <Sparkles className="mr-2 h-5 w-5" />
                                Go Pro - $9.99/mo
                            </Link>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}


