export type AtsSectionConceptId =
    | 'experience'
    | 'education'
    | 'skills'
    | 'projects'
    | 'certifications'
    | 'languages';

export type AtsContactField =
    | 'fullName'
    | 'email'
    | 'phone'
    | 'location'
    | 'linkedin'
    | 'portfolio'
    | 'github';

export type AtsSectionConcept = {
    id: AtsSectionConceptId;
    required: boolean;
    weight: number;
    aliases: string[];
    expectsDates: boolean;
};

export type AtsContactRule = {
    field: AtsContactField;
    required: boolean;
    weight: number;
};

export type AtsOntology = {
    version: string;
    sections: AtsSectionConcept[];
    contacts: AtsContactRule[];
    actionVerbs: string[];
};

export const ATS_ONTOLOGY: AtsOntology = {
    version: 'ats-ontology-v1-2026-05-13',
    sections: [
        {
            id: 'experience',
            required: true,
            weight: 14,
            expectsDates: true,
            aliases: [
                'experience',
                'work experience',
                'professional experience',
                'employment',
                'career history',
                'is deneyimi',
                'calisma deneyimi',
                'deneyim',
                'tecrube',
            ],
        },
        {
            id: 'education',
            required: true,
            weight: 10,
            expectsDates: true,
            aliases: ['education', 'academic background', 'egitim', 'akademik gecmis'],
        },
        {
            id: 'skills',
            required: true,
            weight: 10,
            expectsDates: false,
            aliases: [
                'skills',
                'technical skills',
                'core competencies',
                'competencies',
                'yetenekler',
                'beceriler',
                'teknik beceriler',
                'teknik yetkinlikler',
                'yetkinlikler',
                'teknolojiler',
                'yazilim becerileri',
            ],
        },
        {
            id: 'projects',
            required: false,
            weight: 3,
            expectsDates: true,
            aliases: ['projects', 'project experience', 'projeler', 'proje deneyimi'],
        },
        {
            id: 'certifications',
            required: false,
            weight: 2,
            expectsDates: false,
            aliases: ['certifications', 'licenses', 'sertifikalar', 'sertifika', 'lisanslar'],
        },
        {
            id: 'languages',
            required: false,
            weight: 1,
            expectsDates: false,
            aliases: ['languages', 'language skills', 'diller', 'yabanci diller'],
        },
    ],
    contacts: [
        { field: 'fullName', required: true, weight: 4 },
        { field: 'email', required: true, weight: 6 },
        { field: 'phone', required: true, weight: 5 },
        { field: 'location', required: false, weight: 3 },
        { field: 'linkedin', required: false, weight: 2 },
        { field: 'portfolio', required: false, weight: 1 },
        { field: 'github', required: false, weight: 1 },
    ],
    actionVerbs: [
        'built',
        'created',
        'designed',
        'developed',
        'delivered',
        'drove',
        'executed',
        'implemented',
        'improved',
        'increased',
        'launched',
        'led',
        'managed',
        'optimized',
        'owned',
        'reduced',
        'scaled',
        'streamlined',
        'supervised',
        'trained',
        'analyzed',
        'coordinated',
        'automated',
        'maintained',
        'supported',
        'yonettim',
        'gelistirdim',
        'olusturdum',
        'tasarladim',
        'iyilestirdim',
        'artirdim',
        'azalttim',
        'uyguladim',
        'yuruttum',
        'koordine ettim',
        'analiz ettim',
    ],
};
