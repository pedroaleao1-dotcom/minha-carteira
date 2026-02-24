
import { GoogleGenAI, Type } from "@google/genai";

// Master tip generation for children - Basic task using flash model
// Added caching to avoid redundant slow API calls
const tipCache: Record<string, { tip: string, timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const getMasterTip = async (context: string) => {
    const cacheKey = context.trim().toLowerCase();
    const cached = tipCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.tip;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Você é um mentor mágico de crianças chamado Mestre dos Sonhos. 
            Gere uma dica curta, motivadora e divertida (em português) para uma criança sobre: ${context}. 
            Máximo 20 palavras.`,
        });
        const tip = response.text || "Continue brilhando, pequeno explorador!";
        
        // Save to cache
        tipCache[cacheKey] = { tip, timestamp: Date.now() };
        
        return tip;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Cada tarefa concluída te deixa mais perto do seu sonho!";
    }
};

// Dream steps generation - Complex reasoning task using pro model
export const generateDreamSteps = async (dreamTitle: string) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Crie um caminho de 5 passos simples e lúdicos para uma criança alcançar o objetivo: "${dreamTitle}". 
            Retorne em formato JSON. Cada passo deve ter um título curto.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                        },
                        required: ["title"]
                    }
                }
            }
        });
        
        // Accessing .text property directly as per guidelines
        const data = JSON.parse(response.text || "[]");
        return data.map((item: any, index: number) => ({
            id: Math.random().toString(36).substr(2, 9),
            title: item.title,
            isCompleted: false,
            orderIndex: index,
            xpReward: (index + 1) * 50
        }));
    } catch (error) {
        console.error("Gemini Steps Error:", error);
        return [
            { id: 's1', title: 'Primeiro Passo', isCompleted: false, orderIndex: 0, xpReward: 50 },
            { id: 's2', title: 'Dedicação Diária', isCompleted: false, orderIndex: 1, xpReward: 100 },
            { id: 's3', title: 'Grande Esforço', isCompleted: false, orderIndex: 2, xpReward: 150 },
            { id: 's4', title: 'Quase Lá', isCompleted: false, orderIndex: 3, xpReward: 200 },
            { id: 's5', title: 'Conquista Final', isCompleted: false, orderIndex: 4, xpReward: 250 }
        ];
    }
};

// Image generation for dreams using flash-image model
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

        // Iterate through candidates and parts to find the image part as per guidelines
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
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
