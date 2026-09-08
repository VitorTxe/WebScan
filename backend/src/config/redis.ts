import { Redis, type RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

// Garante que as variáveis de ambiente sejam carregadas caso o arquivo seja importado de forma isolada
dotenv.config();

/**
 * Lê a URL do Redis via variáveis de ambiente.
 * Suporta tanto o padrão genérico (REDIS_URL) quanto a convenção comum do Upstash (UPSTASH_REDIS_URL).
 */
const rawRedisUrl: string | undefined = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

/**
 * O Upstash opera obrigatoriamente com criptografia em trânsito (TLS) na porta 6379.
 * Fazemos uma normalização preventiva caso a string utilize 'redis://' em vez de 'rediss://'.
 */
const isUpstash: boolean = Boolean(rawRedisUrl?.includes('upstash.io'));
const resolvedRedisUrl: string | undefined = rawRedisUrl
  ? rawRedisUrl.startsWith('redis://') && isUpstash
    ? rawRedisUrl.replace('redis://', 'rediss://')
    : rawRedisUrl
  : undefined;

const baseRedisOptions: RedisOptions = {
  maxRetriesPerRequest: null, // Obrigatório para o BullMQ gerenciar jobs sem estourar limite de retries
  enableReadyCheck: false,    // Otimização necessária para o BullMQ e provedores serverless
  keepAlive: 10000,           // Mantém a conexão TCP ativa a cada 10s para contornar o idle timeout do Upstash
  family: 4,                  // Força resolução IPv4 evitando instabilidades de rota IPv6 em Windows/Cloud
  connectTimeout: 10000,      // Timeout de conexão para handshakes em ambientes remotos

  retryStrategy(times: number): number | null {
    // Estratégia de reconexão exponencial com limite de 3 segundos
    return Math.min(times * 50, 3000);
  },
};

// Injeta configuração de TLS caso o destino seja o Upstash ou utilize esquema 'rediss://'
export const redisOptions: RedisOptions = (isUpstash || resolvedRedisUrl?.startsWith('rediss://'))
  ? {
      ...baseRedisOptions,
      tls: {
        rejectUnauthorized: false,
      },
    }
  : baseRedisOptions;

// Instância protegida do Redis utilizando o padrão Singleton
let redisInstance: Redis | null = null;

/**
 * Retorna a instância ativa do Redis, criando-a se necessário.
 * Configura também todos os listeners de conexão e eventos de observabilidade.
 */
function getRedisInstance(): Redis {
  if (!redisInstance) {
    if (resolvedRedisUrl) {
      // Produção / Cloud: Upstash, Redis Cloud ou instância externa via URI
      redisInstance = new Redis(resolvedRedisUrl, redisOptions);
    } else {
      // Desenvolvimento local: Redis executado via Docker ou localmente
      redisInstance = new Redis({
        ...redisOptions,
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      });
    }

    // Monitoramento de conexão e observabilidade
    redisInstance.on('connect', () => {
      console.log('[Redis] Iniciando conexão...');
    });

    redisInstance.on('ready', () => {
      console.info('[Redis] Conexão ativa, autenticada e pronta para operações.');
    });

    redisInstance.on('error', (error: unknown) => {
      // Tratamento robusto de erros: logs descritivos sem engolir contexto
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
 * Encerra a conexão ativa de forma limpa (Graceful Shutdown)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisInstance) {
    console.log('[Redis] Desconectando e encerrando pool de conexões...');
    await redisInstance.quit();
    redisInstance = null;
  }
}
