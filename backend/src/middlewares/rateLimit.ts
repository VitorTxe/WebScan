import rateLimit from 'express-rate-limit';

interface RateLimiterConfig {
    windowMs: number;
    limit: number;
    message: string;
}

/**
 * Cria um middleware de rate limit padronizado para as rotas da API.
 */
function createRateLimiter({ windowMs, limit, message }: RateLimiterConfig) {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: message },
    });
}

// Limite restrito para criação de scans (enfileiramento + análise de IA)
export const scanCreateLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    limit: 15,
    message: 'Limite de criação de scans atingido. Tente novamente em alguns minutos.',
});

// Limite mais alto para consultas de status (polling do frontend)
export const scanStatusLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    limit: 120,
    message: 'Muitas consultas de status em sequência. Aguarde um instante.',
});
