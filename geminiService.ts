import { GoogleGenAI, Type } from "@google/genai";
import { Message, WorkspaceFile, WorkspaceAction } from "./types";

export const generateCodingResponse = async (
  messages: Message[],
  workspaceFiles: WorkspaceFile[],
  modelName: string = 'gemini-3-pro-preview'
) => {
  try {
    // Safely access the key injected by Vite
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return "Critical: API Key not found in Environment Variables. Please set 'API_KEY' in your deployment settings.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const contextFiles = workspaceFiles
      .map(f => `FILE: ${f.name}\nCONTENT:\n${f.content}`)
      .join('\n\n---\n\n');

    const systemInstruction = `You are CodeScript, a specialized AI coding assistant. 
    Current Workspace Context:
    ${contextFiles || 'The workspace is currently empty.'}
    
    Focus on providing production-ready code. Always use Markdown for code blocks.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: { 
        systemInstruction, 
        temperature: 0.1
      },
    });

    return response.text || "I was unable to generate a response. Please try rephrasing.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Connection Error: ${error instanceof Error ? error.message : 'Unknown error'}. Check your API quota and key configuration.`;
  }
};

export const generateWorkspaceAgentResponse = async (
  prompt: string,
  workspaceFiles: WorkspaceFile[],
  modelName: string = 'gemini-3-pro-preview'
): Promise<{ explanation: string; actions: WorkspaceAction[] }> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing.");

    const ai = new GoogleGenAI({ apiKey });

    const contextFiles = workspaceFiles
      .map(f => `NAME: ${f.name}\nCONTENT:\n${f.content}`)
      .join('\n\n---\n\n');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `COMMAND: ${prompt}\n\nCURRENT WORKSPACE FILES:\n${contextFiles}`,
      config: {
        systemInstruction: `You are the CodeScript Project Agent. Your job is to translate user commands into file operations (CREATE, UPDATE, DELETE). Always respond with strictly valid JSON.`,
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

    return JSON.parse(response.text || '{"explanation": "Parsing error", "actions": []}');
  } catch (error) {
    console.error("Agent Error:", error);
    throw error;
  }
};