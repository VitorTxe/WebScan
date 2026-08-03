import { Redis, type RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

// Garante que as variáveis de ambiente sejam carregadas caso o arquivo seja importado de forma isolada
dotenv.config();

const REDIS_URL = process.env.REDIS_URL


const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null, // Parâmetro obrigatório para compatibilidade perfeita com o BullMQ
  enableReadyCheck: false,  //Impede verificação inicial,necessário para o BullMQ

  retryStrategy(times: number): number | null {
    // Estratégia de reconexão exponencial com limite máximo de 3 segundos
    return Math.min(times * 50, 3000);
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
    if (REDIS_URL) {
      // Produção: Upstash, Redis Cloud ou outro Redis externo
      redisInstance = new Redis(REDIS_URL, redisOptions);
    } else {
      // Desenvolvimento local: Redis executado pelo Docker
      redisInstance = new Redis({
        ...redisOptions,
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      });
    }

    // Monitoramento robusto de estados e observabilidade de conexões
    redisInstance.on('connect', () => {
      console.log('[Redis] Iniciando conexão...');
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
