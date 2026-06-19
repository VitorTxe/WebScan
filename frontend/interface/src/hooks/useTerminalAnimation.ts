import { useState, useEffect, useCallback, useRef } from "react";
import type { LogEntry } from "../components/SecurityTerminal";

interface TerminalAnimationConfig {
  targetUrl: string;
  autoStart?: boolean;
}

const getTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const buildScanSequence = (url?: string): Array<{ log: LogEntry; delay: number }> => [
  {
    log: { timestamp: getTimestamp(), type: "SYS", message: "Inicializando módulos de segurança..." },
    delay: 400,
  },
  {
    log: { timestamp: getTimestamp(), type: "SYS", message: "Carregando base de vulnerabilidades v4.2.7 (CVE 2026)..." },
    delay: 800,
  },
  {
    log: { timestamp: getTimestamp(), type: "INFO", message: "Motor de análise pronto. 12.847 assinaturas carregadas." },
    delay: 600,
  },
  {
    log: { timestamp: getTimestamp(), type: "SYS", message: "Estabelecendo conexão segura (TLS 1.3)..." },
    delay: 1000,
  },
  {
    log: { timestamp: getTimestamp(), type: "SCAN", message: `Alvo definido → ${url || ""}` },
    delay: 500,
  },
  {
    log: { timestamp: getTimestamp(), type: "SCAN", message: "Resolvendo DNS... A record encontrado." },
    delay: 700,
  },
  {
    log: { timestamp: getTimestamp(), type: "SCAN", message: "Iniciando varredura de headers HTTP..." },
    delay: 900,
  },
  {
    log: { timestamp: getTimestamp(), type: "AUTH", message: "Verificando certificado SSL/TLS do servidor..." },
    delay: 1100,
  },
  {
    log: { timestamp: getTimestamp(), type: "SUCCESS", message: "Certificado válido — emitido por Let's Encrypt (exp: 2026-12)." },
    delay: 600,
  },
  {
    log: { timestamp: getTimestamp(), type: "SCAN", message: "Analisando Content-Security-Policy..." },
    delay: 800,
  },
  {
    log: { timestamp: getTimestamp(), type: "SCAN", message: "Analisando X-Frame-Options, HSTS, X-Content-Type..." },
    delay: 700,
  },
  {
    log: { timestamp: getTimestamp(), type: "ERROR", message: "⚠ Header 'X-Frame-Options' ausente — risco de Clickjacking." },
    delay: 500,
  },
  {
    log: { timestamp: getTimestamp(), type: "SCAN", message: "Verificando exposição de informações sensíveis..." },
    delay: 900,
  },
  {
    log: { timestamp: getTimestamp(), type: "SUCCESS", message: "Header 'Strict-Transport-Security' configurado corretamente." },
    delay: 400,
  },
  {
    log: { timestamp: getTimestamp(), type: "INFO", message: "Varredura completa. Aguardando nova requisição..." },
    delay: 0,
  },
];

export function useTerminalAnimation({ targetUrl, autoStart = true }: TerminalAnimationConfig) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const targetUrlRef = useRef(targetUrl);

  // Mantém a ref sempre atualizada
  useEffect(() => {
    targetUrlRef.current = targetUrl;
  }, [targetUrl]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const startAnimation = useCallback(() => {
    clearAllTimeouts();
    setLogs([]);
    setIsAnimating(true);

    const sequence = buildScanSequence(targetUrlRef.current);
    let cumulativeDelay = 300;

    sequence.forEach((step, index) => {
      const entryLog: LogEntry = {
        ...step.log,
        timestamp: getTimestamp(),
      };

      const timeoutId = setTimeout(() => {
        entryLog.timestamp = getTimestamp();
        setLogs((prev) => [...prev, entryLog]);

        if (index === sequence.length - 1) {
          setIsAnimating(false);
        }
      }, cumulativeDelay);

      timeoutsRef.current.push(timeoutId);
      cumulativeDelay += step.delay;
    });
  }, [clearAllTimeouts]);

  // Auto-start ao montar (requestAnimationFrame evita setState síncrono no effect)
  useEffect(() => {
    if (!autoStart) return;

    const frameId = requestAnimationFrame(() => {
      startAnimation();
    });

    return () => {
      cancelAnimationFrame(frameId);
      clearAllTimeouts();
    };
  }, [autoStart, startAnimation, clearAllTimeouts]);

  return { logs, isAnimating, startAnimation };
}
