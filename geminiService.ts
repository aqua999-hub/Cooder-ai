
import { GoogleGenAI } from "@google/genai";
import { Message, WorkspaceFile } from "./types";

// Always use a named parameter for apiKey and use process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCodingResponse = async (
  messages: Message[],
  workspaceFiles: WorkspaceFile[]
) => {
  try {
    const contextFiles = workspaceFiles
      .map(f => `File: ${f.name}\nLanguage: ${f.language}\nContent:\n\`\`\`${f.language}\n${f.content}\n\`\`\``)
      .join('\n\n---\n\n');

    const systemInstruction = `You are CodeScript AI, a world-class senior software engineer and coding specialist. 
    You excel at debugging, refactoring, and architecting complex systems.
    
    The user has the following files in their workspace:
    ${contextFiles}

    When providing code snippets, always use Markdown blocks with the correct language tag.
    Be concise, technical, and helpful. If code is requested, prioritize correctness and efficiency.`;

    // Always use ai.models.generateContent to query GenAI with both model and contents
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction,
        temperature: 0.2, // Lower temperature for more deterministic coding output
        topP: 0.95,
      },
    });

    // Extract text output using the .text property directly
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with the coding engine. Please check your connection and API key.";
  }
};
