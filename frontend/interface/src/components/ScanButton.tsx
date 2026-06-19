import { type FC } from "react";
// import {useScan} from "../hooks/useScan";


interface ButtonProps {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
}

export const ScanButton: FC<ButtonProps> = ({ onClick, label = "Launch Security Scan", disabled = false }) => {
  return (
    <button 
      type="button" 
      onClick={onClick}
      disabled={disabled}
      className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold px-5 py-2.5 rounded-md text-sm transition-all duration-150 flex items-center justify-center gap-2 select-none shadow-[0_0_15px_rgba(34,211,238,0.2)]"
    >
      <span className="text-base">⚡</span>
      {label}
    </button>
  );
};
