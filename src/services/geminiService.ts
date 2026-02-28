import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const explainTopic = async (topic: string, level: string = "beginner") => {
  const model = "gemini-3-flash-preview";
  const prompt = `Explain the following topic in simple terms for a ${level} student: "${topic}". Use analogies where helpful and keep it engaging.`;
  
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
  });
  
  return response.text;
};

export const summarizeNotes = async (notes: string) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Summarize the following study notes into clear, concise bullet points. Highlight key terms and concepts: \n\n${notes}`;
  
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
  });
  
  return response.text;
};

export const generateQuiz = async (content: string) => {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: `Generate 5 multiple-choice questions based on the following content. Return the result as a JSON array of objects, each with 'question', 'options' (array of 4 strings), and 'correctAnswer' (index 0-3). Content: \n\n${content}` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.INTEGER }
          },
          required: ["question", "options", "correctAnswer"]
        }
      }
    }
  });
  
  return JSON.parse(response.text || "[]");
};

export const generateFlashcards = async (content: string) => {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: `Generate 8 flashcards based on the following content. Each flashcard should have a 'front' (question or term) and a 'back' (answer or definition). Return as a JSON array. Content: \n\n${content}` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING }
          },
          required: ["front", "back"]
        }
      }
    }
  });
  
  return JSON.parse(response.text || "[]");
};
