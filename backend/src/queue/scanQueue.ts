import { Queue, type ConnectionOptions } from 'bullmq';
import { redis } from '../config/redis.js';

// Definição estrita e tipada dos dados aceitos pela fila (TypeScript Estrito)
export interface ScanJobData {
  url: string;
  userId: string;
  scanType: 'full' | 'quick';
  createdAt: string;
}

/**
 * Criação da fila de processamento 'scan-tasks' integrada ao nosso singleton do Redis.
 * 
 * Usamos 'redis as unknown as ConnectionOptions' para evitar divergências estritas de tipos
 * nas definições do ioredis aninhadas no BullMQ por conta da flag 'exactOptionalPropertyTypes'.
 * O terceiro argumento genérico 'string' define que o nome dos jobs pode ser dinâmico.
 */
export const scanQueue = new Queue<ScanJobData, any, string>('scan-tasks', {
  connection: redis as unknown as ConnectionOptions,
  defaultJobOptions: {
    attempts: 3, // Número de tentativas automáticas em caso de falhas transitórias
    backoff: {
      type: 'exponential',
      delay: 5000, // Espera 5 segundos na primeira falha, escalando exponencialmente
    },
    removeOnComplete: {
      age: 24 * 3600, // Limpeza automática: remove jobs bem-sucedidos após 24 horas
      count: 1000,    // Mantém no máximo os últimos 1000 jobs para poupar memória do Redis
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Mantém falhas arquivadas por até 7 dias para análise de erros (Logs)
      count: 5000,
    },
  },
});

/**
 * Adiciona uma nova tarefa de varredura na fila de processamento de forma segura e ergonomicamente tipada.
 * 
 * @param url Endereço do site a ser varrido
 * @param userId Identificador único do usuário que solicitou a varredura
 * @param scanType Tipo da varredura ('quick' por padrão ou 'full')
 */
export async function addScanJob(url: string, userId: string, scanType: 'full' | 'quick' = 'quick'): Promise<void> {
  try {
    const jobData: ScanJobData = {
      url,
      userId,
      scanType,
      createdAt: new Date().toISOString(),
    };

    const jobName = `scan-${userId}-${Date.now()}`;
    await scanQueue.add(jobName, jobData);
    console.log(`[Queue] Tarefa enfileirada com sucesso para a URL: ${url}`);
  } catch (error: unknown) {
    // Tratamento robusto de erros no console sem engolir exceções
    console.error(`[Queue] Falha crítica ao enfileirar job de varredura:`, error);
    throw new Error('Não foi possível registrar a varredura na fila de processamento.');
  }
}
