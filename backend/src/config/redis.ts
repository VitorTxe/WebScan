import { Redis, type RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

// Garante que as variáveis de ambiente sejam carregadas caso o arquivo seja importado de forma isolada
dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

const redisOptions: RedisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Parâmetro obrigatório para compatibilidade perfeita com o BullMQ
  retryStrategy(times: number): number | null {
    // Estratégia de reconexão exponencial com limite máximo de 3 segundos
    const delay = Math.min(times * 50, 3000);
    return delay;
  },
};

// Instância protegida do Redis utilizando o padrão Singleton
let redisInstance: Redis | null = null;

/**
 * Retorna a instância ativa do Redis, criando-a se necessário.
 * Configura também todos os listeners de conexão e eventos de observabilidade.
 */
function getRedisInstance(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(redisOptions);

    // Monitoramento robusto de estados e observabilidade de conexões
    redisInstance.on('connect', () => {
      console.log(`[Redis] Iniciando tentativa de conexão em ${REDIS_HOST}:${REDIS_PORT}...`);
    });

    redisInstance.on('ready', () => {
      console.info('[Redis] Conexão ativa, autenticada e pronta para operações.');
    });

    redisInstance.on('error', (error: unknown) => {
      // Tratamento de erros robusto: logs descritivos detalhados sem omitir contexto
      console.error('[Redis] Erro identificado na conexão de dados:', error);
    });

    redisInstance.on('close', () => {
      console.warn('[Redis] A conexão com o servidor foi encerrada.');
    });

    redisInstance.on('reconnecting', (delay: number) => {
      console.log(`[Redis] Tentando restabelecer conexão em ${delay}ms...`);
    });
  }

  return redisInstance;
}

// Instância padrão exportada para operações de uso geral
export const redis = getRedisInstance();

/**
 * Encerra a conexão ativa
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisInstance) {
    console.log('[Redis] Desconectando e encerrando pool de conexões...');
    await redisInstance.quit();
    redisInstance = null;
  }
}
