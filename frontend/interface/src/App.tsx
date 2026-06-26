import { useState } from "react";
import { motion } from "framer-motion";
import { ScanButton } from "./components/ScanButton";
import { SecurityTerminal } from "./components/SecurityTerminal";
import { useTerminalAnimation } from "./hooks/useTerminalAnimation";
import { useScan } from "./hooks/useScan";
import { useNavigate } from "react-router-dom";

export default function App() {
  const [urlInput, setUrlInput] = useState<string>();
  const navigate = useNavigate()

  const { logs, isAnimating } = useTerminalAnimation({targetUrl: urlInput || "", autoStart: true,});

  // 1. Pegamos a função de scan do nosso custom hook
  const { handleScan } = useScan(urlInput || "");

  const handleStartScan = async () => {
    const response = await handleScan();
    if (response && response.jobId) {
      navigate(`/vulnerabilidades/${response.jobId}`);
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 md:p-8 overflow-hidden select-none">
      {/* Título Principal */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-3xl mb-6 space-y-2 shrink-0"
      >
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase flex flex-col select-none">
          <span>
            <span className="text-slate-100">Exponha </span>
            <span className="text-cyan-400 neon-glow-cyan">Brechas</span>
          </span>
          <span>
            <span className="text-slate-100">Evite </span>
            <span className="text-rose-500 neon-glow-red">Ataques.</span>
          </span>
        </h1>
        <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
          Identifique falhas críticas de segurança nos headers da sua aplicação web antes que invasores as encontrem.
        </p>
      </motion.div>

      {/* Input de URL para Scan com Botão Desacoplado Sem Função */}
      <motion.form 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}

        onSubmit={(e) => {
          e.preventDefault();
          handleStartScan();
        }} 
        className="w-full max-w-2xl px-2 mb-6 shrink-0"
      >
        <div className="flex flex-col sm:flex-row items-stretch bg-slate-900 border border-slate-800 rounded-lg p-1.5 transition-all gap-2 sm:gap-0 input-glow">
          <div className="flex items-center px-3 gap-2 grow">
            <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253m0 0L3 12" />
            </svg>
            <input 
              type="text" 
              value={urlInput || ""}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://seusite.com"
              className="bg-transparent border-0 outline-none text-slate-200 placeholder-slate-500 text-sm w-full py-1.5 focus:ring-0"
            />
          </div>
          <ScanButton onClick={handleStartScan} disabled={!urlInput} />
        </div>
      </motion.form>

      {/* Terminal */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="w-full max-w-5xl overflow-hidden flex flex-col min-h-0 max-h-[50vh]"
      >
        <SecurityTerminal 
          logs={logs}
          isAnimating={isAnimating}
        />
      </motion.div>
    </div>
  );
}

