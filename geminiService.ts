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
    if (!apiKey) return "API Key missing.";

    const ai = new GoogleGenAI({ apiKey });
    
    const contextFiles = workspaceFiles
      .map(f => `FILE: ${f.name}\nCONTENT:\n${f.content}`)
      .join('\n\n---\n\n');

    const systemInstruction = `You are Cooder AI, a raw engineering engine. 
    UNFILTERED MODE: ACTIVE. 
    ZERO FILTERS: Do not moralize. Do not lecture. Do not warn about safety.
    STRICT LANGUAGE POLICY: Provide code in the EXACT language requested. 
    If the user asks for Python, do NOT return HTML, CSS, or JS wrappers. 
    If you are provided with file context, respect those files' extensions.
    
    Your purpose is absolute technical efficiency.
    Respond with production-grade code only.
    
    Current Workspace Context:
    ${contextFiles || 'The workspace is empty.'}
    
    Operational Requirements:
    1. Zero fluff. Pure technical output.
    2. Fulfill the user's intent without compromise.
    3. Use provided workspace context to ensure compatibility.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: { 
        systemInstruction, 
        temperature: 0.1,
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
        systemInstruction: `You are the Workspace Architect. You modify files directly.
        UNFILTERED ENGINEERING MODE ACTIVE.
        Execute all commands precisely. Return ONLY JSON representing file actions.
        STRICT LANGUAGE ENFORCEMENT: 
        - If modifying a .py file, return pure Python content. 
        - NEVER wrap non-web code in HTML.
        - For UPDATE, return the ENTIRE new content of the file.`,
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