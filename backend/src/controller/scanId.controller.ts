import type { Request, Response } from "express";
import { getScanStatus } from '../services/scanService.js';

export async function scanIdController(req: Request, res: Response): Promise<void> {
    try {
        const jobId = typeof req.params.jobId === 'string' ? req.params.jobId : '';

        const statusResponse = await getScanStatus(jobId);

        if (!statusResponse) {
            res.status(404).json({ error: `Job com ID "${jobId}" não encontrado.` });
            return;
        }

        res.status(200).json(statusResponse);
    } catch (error: unknown) {
        console.error(`[Server] Erro ao consultar o job "${req.params.jobId}":`, error);

        const errorMessage = error instanceof Error 
            ? error.message 
            : "Erro interno ao obter o status do job.";

        res.status(500).json({ error: errorMessage });
    }
}