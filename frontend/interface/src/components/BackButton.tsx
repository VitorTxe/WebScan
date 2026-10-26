import { type FC } from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export const BackButton: FC<BackButtonProps> = ({ 
  to = "/", 
  label = "Voltar para Home",
  className = "" 
}) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`
        group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold
        text-slate-300 hover:text-slate-100 bg-slate-900/80 hover:bg-slate-800/90
        border border-slate-800 hover:border-slate-700/80
        transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_var(--color-primary-glow)]
        cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50
        ${className}
      `}
    >
      <svg 
        className="w-4 h-4 text-cyan-400 transition-transform duration-200 group-hover:-translate-x-1" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      <span>{label}</span>
    </button>
  );
};
