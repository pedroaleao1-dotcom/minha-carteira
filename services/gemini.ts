
import { GoogleGenAI } from "@google/genai";

// Fix: Use the API key directly from process.env.API_KEY as per guidelines
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