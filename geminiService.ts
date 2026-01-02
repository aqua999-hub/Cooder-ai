
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
      .map(f => `FILE: ${f.name}\nLANGUAGE: ${f.language}\nCONTENT:\n${f.content}`)
      .join('\n\n---\n\n');

    const systemInstruction = `You are CodeScript, a senior full-stack engineer. 
    You excel at refactoring, debugging, and explaining complex logic.
    Current Workspace Context:
    ${contextFiles || 'Workspace is empty.'}
    
    GUIDELINES:
    1. Provide code snippets using Markdown syntax.
    2. Suggest best practices and performance optimizations.
    3. If the user wants to modify files, remind them to use the "Workspace AI" tab for direct file manipulation.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: { 
        systemInstruction, 
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: modelName.includes('pro') ? 4000 : 0 }
      },
    });

    return response.text || "I was unable to process your request.";
  } catch (error) {
    console.error("Chat Generation Error:", error);
    return "Error generating response. Please check your network or try a shorter prompt.";
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
      contents: `COMMAND: ${prompt}\n\nWORKSPACE:\n${contextFiles || 'Empty workspace.'}`,
      config: {
        systemInstruction: `You are the CodeScript Workspace Agent. You have direct file system access.
        YOUR JOB: Translate user commands into specific file operations (CREATE, UPDATE, DELETE).
        
        RULES:
        1. CREATE: Use for new files.
        2. UPDATE: Provide the FULL file content for modified files.
        3. DELETE: Use only if explicitly requested.
        4. Always explain your rationale in the "explanation" field.
        5. RESPOND ONLY IN JSON.`,
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
        },
        thinkingConfig: { thinkingBudget: modelName.includes('pro') ? 8000 : 0 }
      },
    });

    return JSON.parse(response.text || '{"explanation": "No changes made", "actions": []}');
  } catch (error) {
    console.error("Agent Generation Error:", error);
    throw error;
  }
};
