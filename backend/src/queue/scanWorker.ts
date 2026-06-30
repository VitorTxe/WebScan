import { Worker, type Job, type ConnectionOptions } from 'bullmq';
import { redis } from '../config/redis.js';
import type { ScanJobData } from './scanQueue.js';
import { analyzeHeadersWithAi } from '../services/securityAiAnalyzer.js';
import type { AiSecurityAnalysis } from '../types/securityAi.js';

// Função responsável por processar o Job de varredura e integrar com o analisador de IA (Gemini).
// Retorna diretamente o resultado gerado pela IA.
async function processScanJob(job: Job<ScanJobData, AiSecurityAnalysis, string>): Promise<AiSecurityAnalysis> {
  const { url, scanType } = job.data;

  // Passo inicial: Atualiza progresso do Job
  await job.updateProgress(10);
  console.log(`[Worker] Iniciando análise real com IA para o Job ${job.id} | Tipo: ${scanType} | URL: ${url}`);

  try {
    // Executa a análise real utilizando a consultoria de IA e repassa o progresso em tempo real
    const analysisResult = await analyzeHeadersWithAi(url, async (progress) => {
      await job.updateProgress(progress);
    });

    // Passo final: Atualiza progresso do Job para concluído
    await job.updateProgress(100);

    return analysisResult;
  } catch (error: unknown) {
    // Tratamento robusto de erros no console sem engolir exceções
    console.error(
      `[Worker] Falha crítica durante a execução da varredura com IA do Job ${job.id} para a URL: ${url}`,
      error
    );
    throw error;
  }
}

/**
 * Instanciação do Worker que escuta a fila 'scan-tasks'.
 * Passamos a mesma conexão do Redis singleton e definimos AiSecurityAnalysis como retorno.
 */
export const scanWorker = new Worker<ScanJobData, AiSecurityAnalysis, string>('scan-tasks', processScanJob, {
  connection: redis as unknown as ConnectionOptions,
  concurrency: 3, // Processa até 3 varreduras em paralelo
});

// Listeners de Eventos para Observabilidade e Monitoramento
scanWorker.on('active', (job: Job<ScanJobData, AiSecurityAnalysis, string>) => {
  console.log(`[Worker] Job ${job.id} está ativo e sendo processado.`);
});

scanWorker.on('completed', (job: Job<ScanJobData, AiSecurityAnalysis, string>) => {
  console.info(`[Worker] Job ${job.id} finalizado com sucesso!`);
  console.log(`[Worker] Resultado da IA retornado para o Job ${job.id}`);
});

scanWorker.on('failed', (job: Job<ScanJobData, AiSecurityAnalysis, string> | undefined, error: Error) => {
  console.error(`[Worker] Falha no processamento do Job ${job?.id || 'desconhecido'}:`, error.message);
});

scanWorker.on('error', (error: unknown) => {
  console.error('[Worker] Erro crítico global no Worker do BullMQ:', error);
});

