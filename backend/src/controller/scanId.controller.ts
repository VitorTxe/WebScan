import type { Request, Response } from "express";
import { scanQueue } from '../queue/scanQueue.js';
import { type ScanStatusResponse, type AiSecurityAnalysis } from '../types/securityAi.js';

export async function scanIdController(req: Request, res: Response): Promise<void> {
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
}