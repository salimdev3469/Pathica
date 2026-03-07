'use client';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    github: string;
}

export interface Item {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    location: string;
    bullets: string;
    position: number;
}

export interface Section {
    id: string;
    title: string;
    position: number;
    items: Item[];
}

export interface CVState {
    id: string;
    title: string;
    personalInfo: PersonalInfo;
    summary: string;
    personalSectionTitle: string;
    sections: Section[];
}

type CVAction =
    | { type: 'SET_CV'; payload: CVState }
    | { type: 'UPDATE_TITLE'; payload: string }
    | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<PersonalInfo> }
    | { type: 'UPDATE_SUMMARY'; payload: string }
    | { type: 'UPDATE_PERSONAL_SECTION_TITLE'; payload: string }
    | { type: 'ADD_SECTION'; payload: { title: string } }
    | { type: 'UPDATE_SECTION'; payload: { id: string; title: string } }
    | { type: 'REMOVE_SECTION'; payload: string }
    | { type: 'REORDER_SECTIONS'; payload: Section[] }
    | { type: 'ADD_ITEM'; payload: { sectionId: string; item: Omit<Item, 'id' | 'position'> } }
    | { type: 'UPDATE_ITEM'; payload: { sectionId: string; itemId: string; updates: Partial<Item> } }
    | { type: 'REMOVE_ITEM'; payload: { sectionId: string; itemId: string } }
    | { type: 'REORDER_ITEMS'; payload: { sectionId: string; items: Item[] } };

const defaultCVState: CVState = {
    id: crypto.randomUUID(),
    title: 'My CV',
    personalInfo: {
        fullName: 'PRADEEP M',
        email: 'pradeepm.analyst@gmail.com',
        phone: '+91-99999 99999',
        location: 'Hyderabad, Telangana',
        linkedin: 'linkedin.com/in/pradeepanalyst',
        portfolio: 'Portfolio Linked',
        github: '',
    },
    summary: '• Proven ability in analyzing large datasets, debugging SQL queries, and transforming data to drive business decisions.\n• Proficient in creating compelling, interactive dashboards using Power BI, enhancing data accessibility and understanding.\n• Strong command over Excel, SQL, Power BI, enabling efficient data manipulation and analysis.\n• Proficient in market research, requirement gathering, qualitative and quantitative analysis.',
    personalSectionTitle: 'Personal Information & Summary',
    sections: [
        {
            id: crypto.randomUUID(),
            title: 'Experience',
            position: 0,
            items: [
                {
                    id: crypto.randomUUID(),
                    title: 'Deloitte',
                    subtitle: 'Data Integrity & Reporting Analyst',
                    date: 'June 2024 – Present',
                    location: '',
                    bullets: '• Manage and enhance client data across multiple CRM tools, ensuring up-to-date and accurate information.\n• Perform lead verification by researching on LinkedIn and other sources to identify and correct data inconsistencies.\n• Oversee data accuracy and consistency within Deloitte\'s databases through ongoing validation, audits, and updates, leveraging strong analytical skills and attention to detail.',
                    position: 0,
                }
            ],
        },
    ],
};

const cvReducer = (state: CVState, action: CVAction): CVState => {
    switch (action.type) {
        case 'SET_CV':
            return action.payload;
        case 'UPDATE_TITLE':
            return { ...state, title: action.payload };
        case 'UPDATE_PERSONAL_INFO':
            return { ...state, personalInfo: { ...state.personalInfo, ...action.payload } };
        case 'UPDATE_SUMMARY':
            return { ...state, summary: action.payload };
        case 'UPDATE_PERSONAL_SECTION_TITLE':
            return { ...state, personalSectionTitle: action.payload };
        case 'ADD_SECTION': {
            const newSection: Section = {
                id: crypto.randomUUID(),
                title: action.payload.title,
                position: state.sections.length,
                items: [],
            };
            return { ...state, sections: [...state.sections, newSection] };
        }
        case 'UPDATE_SECTION':
            return {
                ...state,
                sections: state.sections.map((s) =>
                    s.id === action.payload.id ? { ...s, title: action.payload.title } : s
                ),
            };
        case 'REMOVE_SECTION':
            return {
                ...state,
                sections: state.sections.filter((s) => s.id !== action.payload).map((s, idx) => ({ ...s, position: idx })),
            };
        case 'REORDER_SECTIONS':
            return { ...state, sections: action.payload };
        case 'ADD_ITEM':
            return {
                ...state,
                sections: state.sections.map((s) => {
                    if (s.id === action.payload.sectionId) {
                        const newItem: Item = {
                            ...action.payload.item,
                            id: crypto.randomUUID(),
                            position: s.items.length,
                        };
                        return { ...s, items: [...s.items, newItem] };
                    }
                    return s;
                }),
            };
        case 'UPDATE_ITEM':
            return {
                ...state,
                sections: state.sections.map((s) => {
                    if (s.id === action.payload.sectionId) {
                        return {
                            ...s,
                            items: s.items.map((i) =>
                                i.id === action.payload.itemId ? { ...i, ...action.payload.updates } : i
                            ),
                        };
                    }
                    return s;
                }),
            };
        case 'REMOVE_ITEM':
            return {
                ...state,
                sections: state.sections.map((s) => {
                    if (s.id === action.payload.sectionId) {
                        return {
                            ...s,
                            items: s.items.filter((i) => i.id !== action.payload.itemId).map((i, idx) => ({ ...i, position: idx })),
                        };
                    }
                    return s;
                }),
            };
        case 'REORDER_ITEMS':
            return {
                ...state,
                sections: state.sections.map((s) =>
                    s.id === action.payload.sectionId ? { ...s, items: action.payload.items } : s
                ),
            };
        default:
            return state;
    }
};

interface CVContextType {
    state: CVState;
    dispatch: React.Dispatch<CVAction>;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider = ({ children, initialState }: { children: ReactNode; initialState?: CVState }) => {
    // Merge initial state properties safely in case DB load has missing new properties
    const safeInitialState = initialState ? {
        ...initialState,
        personalInfo: initialState.personalInfo || defaultCVState.personalInfo,
        summary: initialState.summary || '',
        personalSectionTitle: initialState.personalSectionTitle || defaultCVState.personalSectionTitle,
        sections: initialState.sections || []
    } : defaultCVState;

    const [state, dispatch] = useReducer(cvReducer, safeInitialState);

    return <CVContext.Provider value={{ state, dispatch }}>{children}</CVContext.Provider>;
};

export const useCV = () => {
    const context = useContext(CVContext);
    if (!context) {
        throw new Error('useCV must be used within a CVProvider');
    }
    return context;
};
