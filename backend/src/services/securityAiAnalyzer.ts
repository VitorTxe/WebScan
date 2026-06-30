import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { type AiSecurityAnalysis } from "../types/securityAi.js";
import dotenv from "dotenv";

dotenv.config();

// Inicializa o SDK do Gemini com a chave de API do ambiente
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Função responsável por analisar os headers HTTP de uma URL utilizando a consultoria de IA (Gemini)
export async function analyzeHeadersWithAi(url: string, onProgress?: (progress: number) => void | Promise<void>): Promise<AiSecurityAnalysis> {

  try {
    // 1. Notifica início do download dos headers
    if (onProgress) await onProgress(30);

    // Faz a requisição HTTP rápida para obter os headers reais
    const response = await axios.get(url, {
      timeout: 5000,
      headers: { "User-Agent": "Webscan-Bot/1.0" },
    });

    const headers = response.headers;

    // 2. Notifica início da análise com IA (Gemini)
    if (onProgress) await onProgress(60);

    // Monta o Prompt contextualizado para a IA
    const prompt = `
    Analise os headers HTTP de "${url}" e retorne JSON estrito neste schema:
    {
      "score": number, // 0-100
      "resumo": string, // máx 2 frases
      "headers": [
        {
          "nome": string,
          "status": "presente" | "ausente" | "mal-configurado",
          "severidade": "crítica" | "alta" | "média" | "baixa",
          "valor_atual": string | null,
          "recomendacao": string // máx 1 frase
        }
      ]
    }
    Headers obrigatórios a verificar: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
    Inclua também qualquer header presente que exponha informação sensível (Server, X-Powered-By, etc).
    Headers escaneados:
    ${JSON.stringify(headers)}`;

    // 3. Executa a chamada ao Gemini solicitando retorno no formato JSON estruturado
    const responseAi = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Modelo ideal para análises rápidas e JSON estruturado
      contents: prompt,
      config: {
        // Força a IA a retornar obrigatoriamente no formato JSON
        responseMimeType: "application/json",
      },
    });

    // 4. Notifica finalização do processamento da IA
    if (onProgress) await onProgress(90);

    const responseText = responseAi.text;
    if (!responseText) {
      throw new Error(
        "A resposta gerada pela inteligência artificial foi vazia.",
      );
    }

    // Converte a resposta JSON em um objeto tipado de forma segura
    const analysisResult: unknown = JSON.parse(responseText);

    // Fazemos um type-cast ou validação para garantir a integridade
    return analysisResult as AiSecurityAnalysis;
  } catch (error: unknown) {
    console.error("Erro na análise de segurança com IA:", error);

    throw new Error(
      error instanceof Error
        ? `Falha na consultoria de IA: ${error.message}`
        : "Erro desconhecido ao processar auditoria de IA.",
    );
  }
}
