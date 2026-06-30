import { Queue, type ConnectionOptions, type Job } from "bullmq";
import { redis } from "../config/redis.js";

// Definição dos dados aceitos pela fila
export interface ScanJobData {
  url: string;
  userId: string;
  scanType: "full" | "quick";
  createdAt: string;
}

/**
 * Criação da fila de processamento 'scan-tasks'
 *
 * Usamos 'redis as unknown as ConnectionOptions' para evitar divergências estritas de tipos
 * nas definições do ioredis aninhadas no BullMQ por conta da flag 'exactOptionalPropertyTypes'.
 * O terceiro argumento genérico 'string' define que o nome dos jobs pode ser dinâmico.
 */
export const scanQueue = new Queue<ScanJobData, unknown, string>("scan-tasks", {
  connection: redis as unknown as ConnectionOptions,
  defaultJobOptions: {
    attempts: 3, // Número de tentativas automáticas em caso de falhas transitórias
    backoff: {
      type: "exponential",
      delay: 5000, // Espera 5 segundos na primeira falha, escalando exponencialmente
    },
    removeOnComplete: {
      age: 24 * 3600, // Limpeza automática: remove jobs bem-sucedidos após 24 horas
      count: 100, // Mantém no máximo os últimos 100 jobs para poupar memória do Redis
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Mantém falhas arquivadas por até 7 dias para análise de erros (Logs)
      count: 5000,
    },
  },
});


export async function addScanJob(url: string, userId: string, scanType: "full" | "quick" = "quick") : Promise<Job<ScanJobData, unknown, string>> {
  try {
    const jobData: ScanJobData = {
      url,
      userId,
      scanType,
      createdAt: new Date().toISOString(),
    };

    const jobName = `scan-${userId}-${Date.now()}`;
    const job = await scanQueue.add(jobName, jobData);

    console.log(`[Queue] Tarefa enfileirada com sucesso para a URL: ${url} | Job ID: ${job.id}`);

    return job;

  } catch (error: unknown) {
    // Tratamento robusto de erros no console sem engolir exceções
    console.error(`[Queue] Falha ao enfileirar job de varredura:`, error);
    throw new Error(
      "Não foi possível registrar a varredura na fila de processamento.",
    );
  }
}


