import type { Request, Response } from "express";
import { createScan } from '../services/scanService.js';

export async function scanController(req: Request, res: Response): Promise<void> {
    try {
        const { url, userId = "user-default", scanType = "quick" } = req.body;

        if (!url) {
            res.status(400).json({ error: "A URL é obrigatória para iniciar a varredura." });
            return;
        }

        // Registra o scan de forma atômica no Redis e inicia a análise assíncrona
        const jobId = await createScan(url, userId, scanType);
        console.log(`[Server] Job ${jobId} iniciado para a URL: ${url}`);

        res.status(202).json({
            jobId,
            message: "Varredura enfileirada com sucesso. Acompanhe o progresso usando GET /scan/:jobId.",
        });
    } catch (error: unknown) {
        console.error("[Server] Erro ao registrar varredura:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Erro interno ao processar a varredura.";

        res.status(500).json({ error: errorMessage });
    }
}
