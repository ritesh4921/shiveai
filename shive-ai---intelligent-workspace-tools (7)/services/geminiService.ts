import { GoogleGenAI } from "@google/genai";
import { AIActionType } from "../types";

// -----------------------------
// SYSTEM INSTRUCTION
// -----------------------------
const getSystemInstruction = (type: AIActionType): string => {
  switch (type) {
    case AIActionType.ESSAY:
      return "You are an academic essay writer for students. Write structured, clear, and well-referenced essays. Use simple but professional English.";
    case AIActionType.SUMMARIZE:
      return "You are a precise summarizer. Create bulleted summaries of the provided text.";
    case AIActionType.PARAPHRASE:
      return "You are a paraphrasing expert. Rewrite the text to remove plagiarism.";
    case AIActionType.ASSIGNMENT:
      return "You are a tutor. Explain clearly and step-by-step.";
    case AIActionType.GRAMMAR:
      return "You are a strict grammar checker. Fix all mistakes and show corrected text.";
    default:
      return "You are a helpful AI assistant.";
  }
};

// -----------------------------
// ✅ STABLE MODEL SELECTOR (NO 404)
// -----------------------------
const getModelForType = (type: AIActionType): string => {
  switch (type) {
    case AIActionType.SUMMARIZE:
    case AIActionType.GRAMMAR:
    case AIActionType.PARAPHRASE:
      return "gemini-2.5-flash"; // ✅ FAST + SAFE

    case AIActionType.ESSAY:
    case AIActionType.ASSIGNMENT:
      return "gemini-2.5-pro"; // ✅ STRONG REASONING

    default:
      return "gemini-2.5-flash";
  }
};

// -----------------------------
// ✅ TEXT GENERATION FUNCTION
// -----------------------------
export const generateAIContent = async (
  prompt: string,
  type: AIActionType,
  customSystemInstruction?: string
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });
    const modelName = getModelForType(type);
    const systemInstruction = customSystemInstruction || getSystemInstruction(type);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        systemInstruction,
      },
    });

    return response.text || "No output generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error?.message || error);
    return "Error: AI request failed.";
  }
};

// -----------------------------
// ✅ IMAGE ANALYSIS FUNCTION
// -----------------------------
export const analyzeImageWithGemini = async (
  file: File,
  prompt: string
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    // Convert image to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // ✅ BEST MULTIMODAL STABLE MODEL
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: file.type, data: base64Data } },
            { text: prompt },
          ],
        },
      ],
    });

    return response.text || "No analysis output.";
  } catch (error: any) {
    console.error("Gemini Image Error:", error?.message || error);
    return "Error: Image analysis failed.";
  }
};
