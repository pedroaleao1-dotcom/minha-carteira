
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMasterTip = async (context: string) => {
    try {
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
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        text: `Crie uma imagem vibrante, mágica e estilo animação 3D para crianças de um sonho: ${prompt}. Estilo alegre, cores vivas, alta qualidade.`,
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
