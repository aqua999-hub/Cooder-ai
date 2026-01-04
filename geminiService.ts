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

    const systemInstruction = `You are Cooder, a super friendly coding buddy for kids. 
    Speak in very simple, normal human language. Don't use big technical words. 
    
    STRICT RULES:
    1. If the user asks for Python, give them Python code blocks. 
    2. If they ask for Javascript, give them Javascript code blocks.
    3. Be encouraging and helpful!
    
    Here is what is in our folder right now:
    ${contextFiles || 'The folder is empty.'}`;

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

    return response.text || "I'm not sure what to say! Can you try asking again?";
  } catch (error) {
    console.error("Chat Error:", error);
    return `Oh no! Something went wrong. I couldn't think of a response.`;
  }
};

export const generateWorkspaceAgentResponse = async (
  prompt: string,
  workspaceFiles: WorkspaceFile[],
  modelName: string = DEFAULT_MODEL
): Promise<{ explanation: string; actions: WorkspaceAction[] }> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("Missing API Key");

    const ai = new GoogleGenAI({ apiKey });

    const contextFiles = workspaceFiles
      .map(f => `NAME: ${f.name}\nCONTENT:\n${f.content}`)
      .join('\n\n---\n\n');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `User wants to do this: ${prompt}\n\nFiles in the folder:\n${contextFiles}`,
      config: {
        systemInstruction: `You are the Folder Friend. You help create or change files.
        You MUST talk like a normal person, not a robot. 
        
        Return ONLY a JSON object with:
        - "explanation": A friendly message telling the user what you did.
        - "actions": A list of things to do (type: 'CREATE', 'UPDATE', or 'DELETE').
        
        Example: {"explanation": "I made that python file for you!", "actions": [{"type": "CREATE", "fileName": "hello.py", "content": "print('hi')", "explanation": "Creating file"}]}`,
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

    const text = response.text || '{"explanation": "I did it!", "actions": []}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Workspace Agent Error:", error);
    return {
      explanation: "I'm sorry, I couldn't change the files. Something went wrong!",
      actions: []
    };
  }
};