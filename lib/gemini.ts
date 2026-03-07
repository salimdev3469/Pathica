import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder_api_key');

export const flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
export const proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
