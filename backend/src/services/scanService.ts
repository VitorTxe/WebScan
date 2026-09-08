import crypto from 'node:crypto';
import { redis } from '../config/redis.js';
import { analyzeHeadersWithAi } from './securityAiAnalyzer.js';
import type { ScanStatusResponse, AiSecurityAnalysis } from '../types/securityAi.js';

// TTL das chaves no Redis (em segundos)
const SCAN_TTL_SUCCESS_SECONDS = 24 * 60 * 60; // 24 horas para varreduras concluídas
const SCAN_TTL_FAILURE_SECONDS = 7 * 24 * 60 * 60; // 7 dias para falhas arquivadas

/**
 * Cria uma nova solicitação de varredura no Redis de forma atômica e dispara
 * a análise em background sem depender de workers ativos em loop de polling.
 */
export async function createScan(
  url: string,
  userId: string,
  scanType: 'full' | 'quick' = 'quick'
): Promise<string> {
  const jobId = `scan-${crypto.randomUUID()}`;
  const redisKey = `scan:${jobId}`;

  const initialStatus: ScanStatusResponse = {
    jobId,
    status: 'active',
    progress: 10,
    result: null,
    error: null,
  };

  try {
    // 1 único comando no Redis: salva o estado inicial com expiração automática (TTL)
    await redis.setex(redisKey, SCAN_TTL_SUCCESS_SECONDS, JSON.stringify(initialStatus));
    console.log(`[ScanService] Job ${jobId} registrado para a URL: ${url} (User: ${userId}, Tipo: ${scanType})`);

    // Dispara a execução assíncrona desacoplada no Node.js (não bloqueia a resposta HTTP)
    void runScanProcessing(jobId, url, scanType);

    return jobId;
  } catch (error: unknown) {
    console.error(`[ScanService] Falha ao registrar job ${jobId} no Redis:`, error);
    throw new Error('Não foi possível registrar a varredura no banco de dados.');
  }
}

/**
 * Orquestrador assíncrono do processamento com IA.
 * Atualiza o estado no Redis conforme marcos de progresso são alcançados.
 */
async function runScanProcessing(
  jobId: string,
  url: string,
  scanType: 'full' | 'quick'
): Promise<void> {
  const redisKey = `scan:${jobId}`;

  try {
    console.log(`[ScanService] Iniciando processamento de IA para o Job ${jobId} | URL: ${url}`);

    const analysisResult: AiSecurityAnalysis = await analyzeHeadersWithAi(url, async (progress: number) => {
      // Atualiza o progresso no Redis para o polling do frontend
      const currentPayload: ScanStatusResponse = {
        jobId,
        status: 'active',
        progress,
        result: null,
        error: null,
      };
      await redis.setex(redisKey, SCAN_TTL_SUCCESS_SECONDS, JSON.stringify(currentPayload));
    });

    // Salva o resultado final concluído
    const completedPayload: ScanStatusResponse = {
      jobId,
      status: 'completed',
      progress: 100,
      result: analysisResult,
      error: null,
    };

    await redis.setex(redisKey, SCAN_TTL_SUCCESS_SECONDS, JSON.stringify(completedPayload));
    console.info(`[ScanService] Job ${jobId} finalizado e armazenado com sucesso no Redis.`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno durante a análise com IA.';
    console.error(`[ScanService] Falha na execução do Job ${jobId} para a URL: ${url}:`, error);

    const failedPayload: ScanStatusResponse = {
      jobId,
      status: 'failed',
      progress: 0,
      result: null,
      error: errorMessage,
    };

    try {
      await redis.setex(redisKey, SCAN_TTL_FAILURE_SECONDS, JSON.stringify(failedPayload));
    } catch (saveError: unknown) {
      console.error(`[ScanService] Falha crítica ao persistir status de erro do Job ${jobId}:`, saveError);
    }
  }
}

/**
 * Consulta o status e resultado de uma varredura via chave única no Redis.
 * Consome apenas 1 comando de leitura (GET) sob demanda do frontend.
 */
export async function getScanStatus(jobId: string): Promise<ScanStatusResponse | null> {
  const redisKey = `scan:${jobId}`;

  try {
    const rawData = await redis.get(redisKey);

    if (!rawData) {
      return null;
    }

    const parsedData = JSON.parse(rawData) as ScanStatusResponse;
    return parsedData;
  } catch (error: unknown) {
    console.error(`[ScanService] Erro ao consultar status do Job ${jobId} no Redis:`, error);
    throw new Error('Falha ao recuperar dados da varredura.');
  }
}
