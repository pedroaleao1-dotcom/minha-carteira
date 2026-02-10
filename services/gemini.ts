
import { GoogleGenAI } from "@google/genai";

export const getMasterTip = async (context: string) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Você é um mentor mágico de crianças chamado Mestre dos Sonhos. 
            Gere uma dica curta, motivadora e divertida (em português) para uma criança sobre: ${context}. 
            Máximo 20 palavras.`,
        });
        return response.text || "Continue brilhando, pequeno explorador!";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Cada tarefa concluída te deixa mais perto do seu sonho!";
    }
};

export const generateDreamImage = async (prompt: string) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        text: `ESTILO: Flat Vector Illustration, Sticker style, Die-cut, High contrast, bold lines, 2D minimalist graphic. 
                        ASSUNTO: ${prompt}. 
                        CORES: Vibrantes e sólidas. 
                        FUNDO: Branco sólido ou isolado. 
                        Qualidade máxima, sem sombras complexas ou degradês realistas.`,
                    },
                ],
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            }
        });

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
};
