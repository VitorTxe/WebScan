import { type FC, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface LogEntry {
  timestamp: string;
  type: "SYS" | "SCAN" | "AUTH" | "SUCCESS" | "ERROR" | "INFO";
  message: string;
}

export type ScanStatus = "idle" | "waiting" | "active" | "completed" | "failed";

interface SecurityTerminalProps {
  logs: LogEntry[];
  isAnimating?: boolean;
}

export const SecurityTerminal: FC<SecurityTerminalProps> = ({ logs, isAnimating = false }) => {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLogColor = (type: LogEntry["type"]): string => {
    switch (type) {
      case "SYS": return "text-blue-400";
      case "SCAN": return "text-amber-400";
      case "AUTH": return "text-purple-400";
      case "SUCCESS": return "text-emerald-400";
      case "ERROR": return "text-rose-500 font-bold";
      default: return "text-slate-400";
    }
  };

  const getLogPrefix = (type: LogEntry["type"]): string => {
    switch (type) {
      case "SYS": return "⚙";
      case "SCAN": return "🔍";
      case "AUTH": return "🔐";
      case "SUCCESS": return "✓";
      case "ERROR": return "✗";
      default: return "›";
    }
  };

  return (
    <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden mt-10 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between select-none">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
        </div>
        <div className="font-mono text-xs text-slate-500 flex items-center gap-2">
          {isAnimating && (
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"
            />
          )}
        </div>
      </div>

      {/* Body */}
      <div className=" min-h-[325px]">
        {/* Left Side: Logs */}
        <div className="col-span-2 p-6 flex flex-col justify-between font-mono text-xs md:text-sm bg-color-950">
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
            <div className="text-cyan-400 font-bold tracking-wider mb-4 select-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              CONSOLE THREAT MONITOR
            </div>

            <AnimatePresence initial={false}>
              {logs.map((log, index) => (
                <motion.div
                  key={`${log.timestamp}-${index}`}
                  initial="hidden"
                  animate="visible"
                  className="flex gap-2 items-start leading-relaxed"
                >
                  <span className="text-slate-600 select-none shrink-0">[{log.timestamp}]</span>
                  <span className="select-none shrink-0">{getLogPrefix(log.type)}</span>
                  <span className={`${getLogColor(log.type)} shrink-0`}>{log.type}:</span>
                  <span className="text-slate-300">{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Cursor piscante quando está animando */}
            {isAnimating && (
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                className="text-cyan-400 font-bold text-base select-none"
              >
                ▌
              </motion.div>
            )}

            <div ref={terminalEndRef} />
          </div>
        </div>    
      </div>
    </div>
  );
};
