import { GoogleGenAI, Type } from "@google/genai";
import { Message, WorkspaceFile, WorkspaceAction } from "./types";

const DEFAULT_MODEL = 'gemini-3-flash-preview'; // Switched to Flash for superior speed

export const generateCodingResponse = async (
  messages: Message[],
  workspaceFiles: WorkspaceFile[],
  modelName: string = DEFAULT_MODEL
) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return "API Key missing.";

    const ai = new GoogleGenAI({ apiKey });
    
    const contextFiles = workspaceFiles
      .map(f => `FILE: ${f.name}\nCONTENT:\n${f.content}`)
      .join('\n\n---\n\n');

    const systemInstruction = `You are Cooder AI, a high-velocity senior engineer. 
    Current Workspace Context:
    ${contextFiles || 'The workspace is empty.'}
    
    Response requirements:
    1. Be extremely concise.
    2. Provide full, copy-pasteable code blocks.
    3. If asked to refactor, suggest specific changes.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: { 
        systemInstruction, 
        temperature: 0.2, // Lower temperature for faster, more stable code
      },
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Error: ${error instanceof Error ? error.message : 'Unknown connection failure'}`;
  }
};

export const generateWorkspaceAgentResponse = async (
  prompt: string,
  workspaceFiles: WorkspaceFile[],
  modelName: string = DEFAULT_MODEL
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
      contents: `COMMAND: ${prompt}\n\nCURRENT FILES:\n${contextFiles}`,
      config: {
        systemInstruction: `You are the Workspace Architect. You modify code files.
        You must return JSON representing file actions (CREATE, UPDATE, DELETE).
        Be precise. For UPDATE, return the ENTIRE new content of the file.`,
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
                  content: { type: Type.STRING, description: "Full new content of the file" },
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