import { type FC } from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
}

export const ScanButton: FC<ButtonProps> = ({ onClick, label = "Get Started", disabled = false }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.04, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`
        relative px-5 py-2.5 rounded-xl font-bold text-sm select-none
        flex items-center justify-center gap-2 overflow-hidden
        transition-all duration-300 ease-out
        ${disabled 
          ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700/50" 
          : "bg-linear-to-r from-primary to-primary-hover text-slate-950 cursor-pointer shadow-[0_0_20px_var(--color-primary-glow)] hover:shadow-[0_0_30px_var(--color-primary-glow)] border border-primary/20"
        }
      `}
    >
      <motion.span 
        className="text-base"
        animate={disabled ? {} : { 
          scale: [1, 1.25, 1],
          filter: ["drop-shadow(0 0 2px rgba(255,255,255,0.4))", "drop-shadow(0 0 8px rgba(255,255,255,0.8))", "drop-shadow(0 0 2px rgba(255,255,255,0.4))"]
        }}
      >
        ⚡
      </motion.span>
      <span className="tracking-wide">{label}</span>
      
      {/* Efeito de brilho reflexivo (shimmer) ao passar o mouse */}
      {!disabled && (
        <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite]" />
      )}
    </motion.button>
  );
};
