import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'hello' })
  .then(r => console.log('SUCCESS'))
  .catch(err => console.error('FAIL', err.name, err.message, err.stack));
