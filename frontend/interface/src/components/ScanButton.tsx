import { type FC } from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  onClick?: () => void;
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ScanButton: FC<ButtonProps> = ({ 
  onClick, 
  label = "Iniciar Scan", 
  loadingLabel = "Analisando...",
  disabled = false,
  isLoading = false,
}) => {
  const isButtonDisabled = disabled || isLoading;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isButtonDisabled}
      aria-busy={isLoading}
      whileHover={isButtonDisabled ? {} : { scale: 1.04, y: -1 }}
      whileTap={isButtonDisabled ? {} : { scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`
        relative px-5 py-2.5 rounded-xl font-bold text-sm select-none
        flex items-center justify-center gap-2 overflow-hidden
        transition-all duration-300 ease-out
        ${disabled && !isLoading
          ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700/50" 
          : isLoading
            ? "bg-linear-to-r from-primary to-primary-hover text-slate-950 opacity-85 cursor-wait shadow-[0_0_20px_var(--color-primary-glow)] border border-primary/20"
            : "bg-linear-to-r from-primary to-primary-hover text-slate-950 cursor-pointer shadow-[0_0_20px_var(--color-primary-glow)] hover:shadow-[0_0_30px_var(--color-primary-glow)] border border-primary/20"
        }
      `}
    >
      {isLoading ? (
        <svg
          className="w-4 h-4 animate-spin text-slate-950 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <motion.span 
          className="text-base"
          animate={disabled ? {} : { 
            scale: [1, 1.25, 1],
            filter: ["drop-shadow(0 0 2px rgba(255,255,255,0.4))", "drop-shadow(0 0 8px rgba(255,255,255,0.8))", "drop-shadow(0 0 2px rgba(255,255,255,0.4))"]
          }}
        >
          ⚡
        </motion.span>
      )}

      <span className="tracking-wide">
        {isLoading ? loadingLabel : label}
      </span>
      
      {/* Efeito de brilho reflexivo (shimmer) ao passar o mouse */}
      {!isButtonDisabled && (
        <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite]" />
      )}
    </motion.button>
  );
};
