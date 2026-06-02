import { Worker, type Job, type ConnectionOptions } from 'bullmq';
import { redis } from '../config/redis.js';
import type { ScanJobData } from './scanQueue.js';

/**
 * Função responsável pelo processamento real da varredura (Vulnerability Scan).
 * Aqui é onde você integrará suas ferramentas de análise HTTP, Nmap, Axios ou APIs de terceiros.
 * 
 * @param job Instância do Job contendo os dados tipados vindos da fila
 */
async function processScanJob(job: Job<ScanJobData, any, string>): Promise<unknown> {
  const { url, userId, scanType } = job.data;

  // Atualização opcional de progresso para que o usuário final acompanhe pelo frontend
  await job.updateProgress(10);
  console.log(`[Worker] Iniciando análise do Job ${job.id} | Tipo: ${scanType} | URL: ${url}`);

  // Simulação de etapas da varredura em segundo plano (Assíncrona)
  await job.updateProgress(40);
  await new Promise((resolve) => setTimeout(resolve, 3000)); // Espera 3 segundos

  await job.updateProgress(80);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Espera 2 segundos

  // Simulação de erro em caso de rota específica de teste para avaliar o retry automático
  if (url.includes('fail-test')) {
    throw new Error('Erro crítico simulado: Servidor de destino recusou conexões na porta 80.');
  }

  await job.updateProgress(100);

  // Retorno estruturado do resultado do job, que será capturado pelo evento 'completed'
  return {
    success: true,
    targetUrl: url,
    scannedBy: userId,
    type: scanType,
    vulnerabilitiesFound: 0, // Esqueleto inicial de retorno
    finishedAt: new Date().toISOString(),
  };
}

/**
 * Instanciação do Worker que escuta a fila 'scan-tasks'.
 * Passamos a mesma conexão do Redis singleton para otimizar os recursos do container.
 */
export const scanWorker = new Worker<ScanJobData, any, string>('scan-tasks', processScanJob, {
  connection: redis as unknown as ConnectionOptions,
  concurrency: 2, // Configuração Recomendada: processa até 2 varreduras em paralelo
}
);

// Listeners de Eventos para Observabilidade e Monitoramento
scanWorker.on('active', (job: Job<ScanJobData, any, string>) => {
  console.log(`[Worker] Job ${job.id} está ativo e sendo processado.`);
});

scanWorker.on('completed', (job: Job<ScanJobData, any, string>, result: unknown) => {
  console.info(`[Worker] Job ${job.id} finalizado com sucesso! Resultado:`, result);
});

scanWorker.on('failed', (job: Job<ScanJobData, any, string> | undefined, error: Error) => {
  // Tratamento robusto: logs claros para alertar falhas na varredura sem travar a aplicação
  console.error(`[Worker] Falha no processamento do Job ${job?.id || 'desconhecido'}:`, error.message);
});

scanWorker.on('error', (error: unknown) => {
  console.error('[Worker] Erro crítico global no Worker do BullMQ:', error);
});
