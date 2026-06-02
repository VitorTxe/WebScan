// src/services/securityAiAnalyzer.ts
import axios from 'axios';
import { GoogleGenAI } from '@google/genai'; // Ou @google/generative-ai dependendo da versão
import { type AiSecurityAnalysis } from '../types/securityAi.js';
import dotenv from 'dotenv'

dotenv.config()

// Inicializa o SDK do Gemini com a chave de API do ambiente
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeHeadersWithAi(url: string): Promise<AiSecurityAnalysis> {
  try {
    // 1. Faz a requisição HTTP rápida para obter os headers reais
    const response = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'Webscan-Bot/1.0' }
    });

    const headers = response.headers;

    // 2. Monta o Prompt contextualizado para a IA
    const prompt = `
      Você é um Engenheiro de Segurança de Informação e Especialista em DevSecOps Sênior.
      Analise os cabeçalhos HTTP reais abaixo do site "${url}" e identifique brechas de segurança, 
      falhas de configuração e cabeçalhos de segurança ausentes (como CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc.).

      Cabeçalhos HTTP escaneados:
      ${JSON.stringify(headers, null, 2)}

      Gere um relatório estruturado no formato JSON estrito, contendo um resumo geral e uma lista de recomendações 
      detalhadas para cada cabeçalho analisado. Escreva sempre em português brasileiro e com tom profissional.
    `;

    // 3. Executa a chamada ao Gemini solicitando retorno no formato JSON estruturado
    const responseAi = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Modelo ideal para análises rápidas e JSON estruturado
      contents: prompt,
      config: {
        // Força a IA a retornar obrigatoriamente no formato JSON
        responseMimeType: 'application/json',
      }
    });

    const responseText = responseAi.text;
    if (!responseText) {
      throw new Error('A resposta gerada pela inteligência artificial foi vazia.');
    }

    // 4. Converte a resposta JSON em um objeto tipado de forma segura
    const analysisResult: unknown = JSON.parse(responseText);

    // Fazemos um type-cast ou validação para garantir a integridade
    return analysisResult as AiSecurityAnalysis;

  } catch (error: unknown) {
    console.error('Erro na análise de segurança com IA:', error);
    
    throw new Error(
      error instanceof Error 
        ? `Falha na consultoria de IA: ${error.message}` 
        : 'Erro desconhecido ao processar auditoria de IA.'
    );
  }
}