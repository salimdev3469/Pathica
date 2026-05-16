import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { buildCvStateFromTemplate, getCvTemplateSeed } from '@/lib/cv-templates';

type NewCVPageProps = {
  searchParams?: {
    template?: string;
    restoreGuest?: string;
  };
};

export default async function NewCVPage({ searchParams }: NewCVPageProps) {
  const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const template = getCvTemplateSeed(searchParams?.template)?.slug;
  const shouldRestoreGuest = searchParams?.restoreGuest === '1';
  const templateSeed = getCvTemplateSeed(template);
  const guestForwardParams = new URLSearchParams();
  const editorForwardParams = new URLSearchParams();

  if (templateSeed) {
    guestForwardParams.set('template', templateSeed.slug);
  }

  if (shouldRestoreGuest) {
    editorForwardParams.set('restoreGuest', '1');
  }

  const guestForwardQuery = guestForwardParams.toString();
  const guestForwardSuffix = guestForwardQuery ? `?${guestForwardQuery}` : '';
  const editorForwardQuery = editorForwardParams.toString();
  const editorForwardSuffix = editorForwardQuery ? `?${editorForwardQuery}` : '';

  if (!user) {
    redirect(`/cv/guest${guestForwardSuffix}`);
  }

  const title = templateSeed ? `${locale === 'tr' ? templateSeed.name.tr : templateSeed.name.en} CV` : locale === 'tr' ? 'Başlıksız CV' : 'Untitled CV';

  const { data: cv, error } = await supabase
    .from('cvs')
    .insert([{ id: crypto.randomUUID(), user_id: user.id, title }])
    .select('id')
    .single();

  if (error || !cv) {
    console.error('Failed to create CV:', error);
    redirect('/dashboard?error=failed_to_create');
  }

  if (templateSeed && !shouldRestoreGuest) {
    const templateState = buildCvStateFromTemplate(templateSeed, locale);

    const { data: personalInfoSection, error: personalInfoSectionError } = await supabase
      .from('cv_sections')
      .insert({ cv_id: cv.id, title: '_personal_info', position: -2 })
      .select('id')
      .single();

    if (personalInfoSectionError || !personalInfoSection) {
      console.error('Failed to create template personal info section:', personalInfoSectionError);
      redirect('/dashboard?error=failed_to_seed_template');
    }

    const { error: personalInfoFieldError } = await supabase.from('cv_fields').insert({
      section_id: personalInfoSection.id,
      label: 'personal_info',
      value: JSON.stringify(templateState.personalInfo),
      field_type: 'json',
      position: 0,
    });

    if (personalInfoFieldError) {
      console.error('Failed to create template personal info field:', personalInfoFieldError);
      redirect('/dashboard?error=failed_to_seed_template');
    }

    const { data: summarySection, error: summarySectionError } = await supabase
      .from('cv_sections')
      .insert({ cv_id: cv.id, title: '_summary', position: -1 })
      .select('id')
      .single();

    if (summarySectionError || !summarySection) {
      console.error('Failed to create template summary section:', summarySectionError);
      redirect('/dashboard?error=failed_to_seed_template');
    }

    const { error: summaryFieldsError } = await supabase.from('cv_fields').insert([
      {
        section_id: summarySection.id,
        label: 'summary',
        value: templateState.summary,
        field_type: 'text',
        position: 0,
      },
      {
        section_id: summarySection.id,
        label: 'summary_title',
        value: templateState.summaryTitle,
        field_type: 'text',
        position: 1,
      },
      {
        section_id: summarySection.id,
        label: 'font_family',
        value: templateState.fontFamily,
        field_type: 'text',
        position: 2,
      },
      {
        section_id: summarySection.id,
        label: 'template_slug',
        value: templateState.templateSlug,
        field_type: 'text',
        position: 3,
      },
    ]);

    if (summaryFieldsError) {
      console.error('Failed to create template summary fields:', summaryFieldsError);
      redirect('/dashboard?error=failed_to_seed_template');
    }

    for (const section of templateState.sections) {
      const { data: insertedSection, error: sectionError } = await supabase
        .from('cv_sections')
        .insert({
          cv_id: cv.id,
          title: section.title,
          position: section.position,
        })
        .select('id')
        .single();

      if (sectionError || !insertedSection) {
        console.error('Failed to create template content section:', sectionError);
        redirect('/dashboard?error=failed_to_seed_template');
      }

      if (section.items.length === 0) {
        continue;
      }

      const fields = section.items.map((item, itemIndex) => ({
        section_id: insertedSection.id,
        label: item.title || 'item',
        value: JSON.stringify({
          ...item,
          id: crypto.randomUUID(),
          position: itemIndex,
        }),
        field_type: 'item',
        position: itemIndex,
      }));

      const { error: itemFieldsError } = await supabase.from('cv_fields').insert(fields);
      if (itemFieldsError) {
        console.error('Failed to create template section items:', itemFieldsError);
        redirect('/dashboard?error=failed_to_seed_template');
      }
    }
  }

  redirect(`/cv/${cv.id}${editorForwardSuffix}`);
}
