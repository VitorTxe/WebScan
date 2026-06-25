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

const buildScanSequence = (): Array<{ log: LogEntry; delay: number }> => [
  {
    log: { timestamp: getTimestamp(), type: "SYS", message: "Conectando ao painel de controle WebScan..." },
    delay: 400,
  },
  {
    log: { timestamp: getTimestamp(), type: "SUCCESS", message: "Conexão estabelecida com sucesso." },
    delay: 600,
  },
  {
    log: { timestamp: getTimestamp(), type: "INFO", message: "Olá! Seja muito bem-vindo ao sistema de auditoria." },
    delay: 800,
  },
  {
    log: { timestamp: getTimestamp(), type: "INFO", message: "Tudo pronto para iniciar uma análise de segurança." },
    delay: 600,
  },
  {
    log: { timestamp: getTimestamp(), type: "SYS", message: "Aguardando envio do site para varredura..." },
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

    const sequence = buildScanSequence();
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
