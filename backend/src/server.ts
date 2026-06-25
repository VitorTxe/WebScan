import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { addScanJob, scanQueue } from './queue/scanQueue.js';
import './queue/scanWorker.js'; // Inicializa o worker em segundo plano
import type { AiSecurityAnalysis } from './types/securityAi.js';

const app = express();
app.use(cors({
    origin: "*"
}));
app.use(express.json());

/**
 * Interface estrita para a resposta do status do job (TypeScript Estrito).
 */
interface ScanStatusResponse {
  jobId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown';
  progress: number;
  result: AiSecurityAnalysis | null;
  error: string | null;
}

app.post("/scan", async (req: Request, res: Response): Promise<void> => {
    try {
        const { url, userId = "user-default", scanType = "quick" } = req.body;

        if (!url) {
            res.status(400).json({ error: "A URL é obrigatória para iniciar a varredura." });
            return;
        }

        // Adiciona a tarefa à fila e retorna imediatamente
        const job = await addScanJob(url, userId, scanType);
        console.log(`[Server] Job ${job.id} enfileirado com sucesso para a URL: ${url}`);

        res.status(202).json({
            jobId: job.id,
            message: "Varredura enfileirada com sucesso. Acompanhe o progresso usando GET /scan/:jobId.",
        });
    } catch (error: unknown) {
        console.error("[Server] Erro ao enfileirar varredura:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Erro interno ao processar a varredura.";

        res.status(500).json({ error: errorMessage });
    }
});

app.get("/scan/:jobId", async (req: Request, res: Response): Promise<void> => {
    try {
        const jobId = typeof req.params.jobId === 'string' ? req.params.jobId : '';

        const job = await scanQueue.getJob(jobId);

        if (!job) {
            res.status(404).json({ error: `Job com ID "${jobId}" não encontrado.` });
            return;
        }

        const state = await job.getState();
        const progress = typeof job.progress === 'number' ? job.progress : 0;

        const response: ScanStatusResponse = {
            jobId: job.id ?? jobId,
            status: state as 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown',
            progress,
            result: state === 'completed' ? (job.returnvalue as AiSecurityAnalysis) : null,
            error: state === 'failed' ? (job.failedReason ?? 'Erro desconhecido durante o processamento do job.') : null,
        };

        res.status(200).json(response);
    } catch (error: unknown) {
        console.error(`[Server] Erro ao consultar o job "${req.params.jobId}":`, error);

        const errorMessage = error instanceof Error 
            ? error.message 
            : "Erro interno ao obter o status do job.";

        res.status(500).json({ error: errorMessage });
    }
});

app.use(cors())

app.listen(3000, () => {
    console.log("Servidor está rodando na porta 3000");
});
