
import { GoogleGenAI, Type } from "@google/genai";
import { Message, WorkspaceFile, WorkspaceAction } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCodingResponse = async (
  messages: Message[],
  workspaceFiles: WorkspaceFile[],
  modelName: string = 'gemini-3-pro-preview'
) => {
  try {
    const contextFiles = workspaceFiles
      .map(f => `FILE: ${f.name}\nCONTENT:\n${f.content}`)
      .join('\n\n---\n\n');

    const systemInstruction = `You are CodeScript, a specialized AI coding assistant. 
    Current Workspace:
    ${contextFiles || 'Empty.'}
    
    Focus on technical accuracy and code quality.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: { 
        systemInstruction, 
        temperature: 0.2
      },
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Error generating response.";
  }
};

export const generateWorkspaceAgentResponse = async (
  prompt: string,
  workspaceFiles: WorkspaceFile[],
  modelName: string = 'gemini-3-pro-preview'
): Promise<{ explanation: string; actions: WorkspaceAction[] }> => {
  try {
    const contextFiles = workspaceFiles
      .map(f => `NAME: ${f.name}\nCONTENT:\n${f.content}`)
      .join('\n\n---\n\n');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `COMMAND: ${prompt}\n\nWORKSPACE:\n${contextFiles}`,
      config: {
        systemInstruction: `CodeScript Workspace Agent. Respond ONLY with valid JSON matching the schema. Translate commands to file actions.`,
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

    return JSON.parse(response.text || '{"explanation": "Error", "actions": []}');
  } catch (error) {
    console.error("Agent Error:", error);
    throw error;
  }
};
