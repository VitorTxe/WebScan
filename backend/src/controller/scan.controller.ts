import type { Request, Response } from "express";
import { addScanJob } from '../queue/scanQueue.js';

export async function scanController(req: Request, res: Response): Promise<void> {
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
}
