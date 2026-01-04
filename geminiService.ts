import { GoogleGenAI, Type } from "@google/genai";
import { Message, WorkspaceFile, WorkspaceAction } from "./types";

const DEFAULT_MODEL = 'gemini-3-flash-preview';

export const generateCodingResponse = async (
  messages: Message[],
  workspaceFiles: WorkspaceFile[],
  modelName: string = DEFAULT_MODEL
) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return "Oops! I can't find my brain (API Key is missing).";

    const ai = new GoogleGenAI({ apiKey });
    
    const contextFiles = workspaceFiles
      .map(f => `FILE: ${f.name}\nCONTENT:\n${f.content}`)
      .join('\n\n---\n\n');

    const systemInstruction = `You are Cooder, a super friendly coding buddy. 
    Speak in very simple, normal human language like a friend. No tech jargon.
    
    STRICT RULES:
    1. If they ask for Python, give Python. 
    2. If they ask for JS, give JS.
    3. Always be helpful!
    
    Current files:
    ${contextFiles || 'None yet.'}`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: { 
        systemInstruction, 
        temperature: 0.7,
      },
    });

    return response.text || "I'm not sure what to say! Can you try again?";
  } catch (error) {
    console.error("Chat Error:", error);
    return `Oh no! Something went wrong. I couldn't think of anything.`;
  }
};

export const generateWorkspaceAgentResponse = async (
  prompt: string,
  workspaceFiles: WorkspaceFile[],
  modelName: string = DEFAULT_MODEL
): Promise<{ explanation: string; actions: WorkspaceAction[] }> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("Missing Key");

    const ai = new GoogleGenAI({ apiKey });

    const contextFiles = workspaceFiles
      .map(f => `NAME: ${f.name}\nCONTENT:\n${f.content}`)
      .join('\n\n---\n\n');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `User wants: ${prompt}\n\nFiles: ${contextFiles}`,
      config: {
        systemInstruction: `You are the Folder Friend. You help create/change files.
        Talk like a normal person. Use phrases like "I did it!" or "Done!".
        
        Return ONLY JSON:
        {
          "explanation": "Friendly short sentence about what you did.",
          "actions": [{"type": "CREATE"|"UPDATE"|"DELETE", "fileName": "name.ext", "content": "full code", "explanation": "why"}]
        }`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['CREATE', 'UPDATE', 'DELETE'] },
                  fileName: { type: Type.STRING },
                  content: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["type", "fileName", "explanation"]
              }
            }
          },
          required: ["explanation", "actions"]
        }
      },
    });

    const text = response.text || '{"explanation": "Done!", "actions": []}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Agent Error:", error);
    return {
      explanation: "Oops, something went wrong and I couldn't change the files.",
      actions: []
    };
  }
};