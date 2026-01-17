
import { GoogleGenAI } from "@google/genai";

export const fetchDynamicGreeting = async (position: { x: number, y: number }, windowSize: { w: number, h: number }): Promise<string> => {
  // Fix: Initializing GoogleGenAI with process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const xRatio = position.x / windowSize.w;
    const yRatio = position.y / windowSize.h;
    
    // Determine a "vibe" based on mouse position
    let vibe = "mysterious";
    if (xRatio < 0.5 && yRatio < 0.5) vibe = "optimistic and bright";
    else if (xRatio >= 0.5 && yRatio < 0.5) vibe = "cyberpunk and energetic";
    else if (xRatio < 0.5 && yRatio >= 0.5) vibe = "calm and zen";
    else vibe = "bold and aggressive";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a creative, short greeting that says "Hello" or "Hey" to the world. It must be themed as: ${vibe}. Max 4 words. No terminal punctuation. Make it unique and innovative.`,
      config: {
        temperature: 0.9,
      }
    });

    return response.text?.trim() || "Hey World";
  } catch (error) {
    console.error("Gemini Greeting Error:", error);
    return "Hey World";
  }
};
