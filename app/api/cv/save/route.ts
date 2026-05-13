import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { ATS_ONTOLOGY } from '@/lib/ats-ontology';
import { calculateKnowledgeBasedAts } from '@/lib/ats-knowledge-score';
import { normalizeCvFont } from '@/lib/cv-fonts';
import { createClient } from '@/lib/supabase-server';
import { isCvTemplateSlug } from '@/lib/cv-templates';

type SaveItem = {
    title?: string;
    subtitle?: string;
    date?: string;
    location?: string;
    bullets?: string;
    position?: number;
};

type SaveSection = {
    title?: string;
    position?: number;
    titleFontSize?: number;
    items?: SaveItem[];
};

type SaveCvState = {
    id: string;
    title?: string;
    templateSlug?: string | null;
    fontFamily?: string;
    personalInfo?: {
        fullName?: string;
        jobTitle?: string;
        email?: string;
        phone?: string;
        location?: string;
        linkedin?: string;
        portfolio?: string;
        github?: string;
        photoDataUrl?: string;
        photoX?: number;
        photoY?: number;
        photoSize?: number;
        fullNameFontSize?: number;
        jobTitleFontSize?: number;
        contactFontSize?: number;
    };
    summaryTitle?: string;
    summaryTitleFontSize?: number;
    summary?: string;
    summaryFontSize?: number;
    letterSpacing?: number;
    sections?: SaveSection[];
};

type AtsMeta = {
    score: number;
    reason: string;
    signature: string;
    source: 'ontology' | 'cached';
};

type CvFieldMetaRow = {
    label: string;
    value: string;
};

type PreviousAtsSectionRow = {
    cv_fields?: CvFieldMetaRow[];
};

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cvState = (await req.json()) as SaveCvState;

        if (!cvState || !cvState.id) {
            return NextResponse.json({ error: 'Invalid CV state' }, { status: 400 });
        }

        // Verify ownership
        const { data: cvCheck } = await supabase
            .from('cvs')
            .select('id')
            .eq('id', cvState.id)
            .eq('user_id', user.id)
            .single();

        if (!cvCheck) {
            return NextResponse.json({ error: 'CV not found or unauthorized' }, { status: 404 });
        }

        const currentSignature = buildAtsSignature(cvState);

        // Read previous ATS metadata before deleting sections.
        const { data: previousAtsRows } = await supabase
            .from('cv_sections')
            .select('cv_fields(label,value)')
            .eq('cv_id', cvState.id)
            .eq('title', '_ats_meta')
            .limit(1);

        const previousAts = parsePreviousAtsMeta((previousAtsRows as PreviousAtsSectionRow[] | null)?.[0]);

        let atsMeta: AtsMeta;
        if (
            previousAts &&
            previousAts.signature === currentSignature &&
            Number.isFinite(previousAts.score) &&
            previousAts.reason.length > 0
        ) {
            atsMeta = {
                score: previousAts.score,
                reason: previousAts.reason,
                signature: currentSignature,
                source: 'cached',
            };
        } else {
            const knowledgeScore = calculateKnowledgeBasedAts(cvState);
            atsMeta = {
                score: knowledgeScore.score,
                reason: knowledgeScore.reason,
                signature: currentSignature,
                source: 'ontology',
            };
        }

        // Update CV title
        await supabase
            .from('cvs')
            .update({
                title: cvState.title,
                updated_at: new Date().toISOString(),
                ats_score: atsMeta.score,
                ats_score_updated_at: new Date().toISOString(),
            })
            .eq('id', cvState.id);

        // Simplest way to update sections/fields perfectly is to delete old and insert new.
        await supabase.from('cv_sections').delete().eq('cv_id', cvState.id);

        // 1. Insert _personal_info section
        const { data: piSection } = await supabase
            .from('cv_sections')
            .insert({ cv_id: cvState.id, title: '_personal_info', position: -2 })
            .select()
            .single();

        if (piSection && cvState.personalInfo) {
            await supabase.from('cv_fields').insert({
                section_id: piSection.id,
                label: 'personal_info',
                value: JSON.stringify(cvState.personalInfo),
                field_type: 'json',
                position: 0,
            });
        }

        // 2. Insert _summary section
        const { data: summarySection } = await supabase
            .from('cv_sections')
            .insert({ cv_id: cvState.id, title: '_summary', position: -1 })
            .select()
            .single();

        if (summarySection) {
            const summaryFields: Array<{ section_id: string; label: string; value: string; field_type: string; position: number }> = [];

            if (typeof cvState.summary === 'string') {
                summaryFields.push({
                    section_id: summarySection.id,
                    label: 'summary',
                    value: cvState.summary,
                    field_type: 'text',
                    position: 0,
                });
            }

            if (typeof cvState.summaryTitle === 'string' && cvState.summaryTitle.trim()) {
                summaryFields.push({
                    section_id: summarySection.id,
                    label: 'summary_title',
                    value: cvState.summaryTitle,
                    field_type: 'text',
                    position: 1,
                });
            }

            summaryFields.push({
                section_id: summarySection.id,
                label: 'font_family',
                value: normalizeCvFont(cvState.fontFamily),
                field_type: 'text',
                position: 2,
            });

            if (typeof cvState.summaryTitleFontSize === 'number') {
                summaryFields.push({
                    section_id: summarySection.id,
                    label: 'summary_title_font_size',
                    value: String(cvState.summaryTitleFontSize),
                    field_type: 'number',
                    position: 3,
                });
            }

            if (typeof cvState.summaryFontSize === 'number') {
                summaryFields.push({
                    section_id: summarySection.id,
                    label: 'summary_font_size',
                    value: String(cvState.summaryFontSize),
                    field_type: 'number',
                    position: 4,
                });
            }

            if (typeof cvState.letterSpacing === 'number') {
                summaryFields.push({
                    section_id: summarySection.id,
                    label: 'letter_spacing',
                    value: String(cvState.letterSpacing),
                    field_type: 'number',
                    position: 5,
                });
            }

            if (typeof cvState.templateSlug === 'string' && isCvTemplateSlug(cvState.templateSlug)) {
                summaryFields.push({
                    section_id: summarySection.id,
                    label: 'template_slug',
                    value: cvState.templateSlug,
                    field_type: 'text',
                    position: 6,
                });
            }

            if (summaryFields.length > 0) {
                await supabase.from('cv_fields').insert(summaryFields);
            }
        }

        // 3. Insert normal user sections
        const sections = Array.isArray(cvState.sections) ? cvState.sections : [];
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const { data: sectionData, error: sectionError } = await supabase
                .from('cv_sections')
                .insert({
                    cv_id: cvState.id,
                    title: section.title,
                    position: typeof section.position === 'number' ? section.position : i,
                })
                .select()
                .single();

            if (sectionError) throw sectionError;

            if (section.items && section.items.length > 0) {
                const fieldsToInsert = section.items.map((item, itemIndex) => ({
                    section_id: sectionData.id,
                    label: item.title || 'item',
                    value: JSON.stringify(item),
                    field_type: 'item',
                    position: typeof item.position === 'number' ? item.position : itemIndex,
                }));

                const { error: fieldsError } = await supabase.from('cv_fields').insert(fieldsToInsert);
                if (fieldsError) throw fieldsError;
            }

            if (typeof section.titleFontSize === 'number') {
                await supabase.from('cv_fields').insert({
                    section_id: sectionData.id,
                    label: 'section_meta',
                    value: JSON.stringify({ titleFontSize: section.titleFontSize }),
                    field_type: 'json',
                    position: -1,
                });
            }
        }

        // 4. Persist ATS metadata as virtual section
        const { data: atsSection, error: atsSectionError } = await supabase
            .from('cv_sections')
            .insert({ cv_id: cvState.id, title: '_ats_meta', position: -3 })
            .select()
            .single();

        if (atsSectionError) {
            console.error('Failed to create ATS metadata section:', atsSectionError);
        } else if (atsSection) {
            const { error: atsFieldsError } = await supabase.from('cv_fields').insert([
                {
                    section_id: atsSection.id,
                    label: 'score',
                    value: String(atsMeta.score),
                    field_type: 'number',
                    position: 0,
                },
                {
                    section_id: atsSection.id,
                    label: 'reason',
                    value: atsMeta.reason,
                    field_type: 'text',
                    position: 1,
                },
                {
                    section_id: atsSection.id,
                    label: 'signature',
                    value: atsMeta.signature,
                    field_type: 'text',
                    position: 2,
                },
                {
                    section_id: atsSection.id,
                    label: 'source',
                    value: atsMeta.source,
                    field_type: 'text',
                    position: 3,
                },
            ]);

            if (atsFieldsError) {
                console.error('Failed to persist ATS metadata fields:', atsFieldsError);
            }
        }

        return NextResponse.json({
            success: true,
            ats: {
                score: atsMeta.score,
                reason: atsMeta.reason,
                source: atsMeta.source,
            },
        });
    } catch (error) {
        console.error('Error saving CV:', error);
        return NextResponse.json({ error: 'Failed to save CV' }, { status: 500 });
    }
}

function parsePreviousAtsMeta(section: PreviousAtsSectionRow | undefined) {
    if (!section || !Array.isArray(section.cv_fields)) {
        return null;
    }

    const scoreRaw = section.cv_fields.find((field) => field.label === 'score')?.value;
    const reasonRaw = section.cv_fields.find((field) => field.label === 'reason')?.value || '';
    const signatureRaw = section.cv_fields.find((field) => field.label === 'signature')?.value || '';

    const parsedScore = Number(scoreRaw);

    if (!Number.isFinite(parsedScore) || !reasonRaw || !signatureRaw) {
        return null;
    }

    return {
        score: Math.max(0, Math.min(100, Math.round(parsedScore))),
        reason: reasonRaw,
        signature: signatureRaw,
    };
}

function buildAtsSignature(cvState: SaveCvState): string {
    const normalized = {
        ontologyVersion: ATS_ONTOLOGY.version,
        title: normalize(cvState.title),
        personalInfo: {
            fullName: normalize(cvState.personalInfo?.fullName),
            email: normalize(cvState.personalInfo?.email),
            phone: normalize(cvState.personalInfo?.phone),
            location: normalize(cvState.personalInfo?.location),
            linkedin: normalize(cvState.personalInfo?.linkedin),
            portfolio: normalize(cvState.personalInfo?.portfolio),
            github: normalize(cvState.personalInfo?.github),
            photoDataUrl: normalize(cvState.personalInfo?.photoDataUrl),
            photoX: typeof cvState.personalInfo?.photoX === 'number' ? cvState.personalInfo.photoX : undefined,
            photoY: typeof cvState.personalInfo?.photoY === 'number' ? cvState.personalInfo.photoY : undefined,
            photoSize: typeof cvState.personalInfo?.photoSize === 'number' ? cvState.personalInfo.photoSize : undefined,
        },
        summary: normalize(cvState.summary),
        fontFamily: normalizeCvFont(cvState.fontFamily),
        sections: (Array.isArray(cvState.sections) ? cvState.sections : [])
            .map((section, sectionIndex) => ({
                title: normalize(section.title),
                position: typeof section.position === 'number' ? section.position : sectionIndex,
                items: (Array.isArray(section.items) ? section.items : [])
                    .map((item, itemIndex) => ({
                        title: normalize(item.title),
                        subtitle: normalize(item.subtitle),
                        date: normalize(item.date),
                        location: normalize(item.location),
                        bullets: normalize(item.bullets),
                        position: typeof item.position === 'number' ? item.position : itemIndex,
                    }))
                    .sort((a, b) => a.position - b.position),
            }))
            .sort((a, b) => a.position - b.position),
    };

    return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

function normalize(value: unknown): string {
    if (typeof value !== 'string') {
        return '';
    }

    return value.replace(/\s+/g, ' ').trim();
}
