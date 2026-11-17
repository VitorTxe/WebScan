import type { Request, Response } from "express";
import { redis } from "../config/redis.js";

/**
 * Controller de Healthcheck da API.
 * Sem o cabeçalho `x-ping-secret` (quando `PING_SECRET` está configurado),
 * retorna apenas o status básico da aplicação.
 * Quando autenticado, mede a latência de resposta do Redis via PING.
 */
export async function health(req: Request, res: Response): Promise<void> {
    const pingSecret = process.env.PING_SECRET;
    if (pingSecret && req.headers["x-ping-secret"] !== pingSecret) {
        res.status(200).json({ status: "ok" });
        return;
    }

    try {
        const start = performance.now();
        await redis.ping();
        const dbLatencyMs = Math.round(performance.now() - start);

        res.status(200).json({ status: "ok", dbLatencyMs });
    } catch (error: unknown) {
        console.error("[Server] Erro ao verificar saúde do Redis:", error);
        res.status(503).json({ status: "error" });
    }
}
