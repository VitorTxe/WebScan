import { type HeaderScanResult } from "../types/scan";

const getSeverityColor = (severity: string) => {
    const nameSeverity = severity.toLowerCase();
    if (nameSeverity.includes("crítico") || nameSeverity.includes("critico") || nameSeverity.includes("crítica")) return "text-alert-critical border-alert-critical/30 bg-alert-critical/10";
    if (nameSeverity.includes("alto") || nameSeverity.includes("alta")) return "text-alert-high border-alert-high/30 bg-alert-high/10";
    if (nameSeverity.includes("médio") || nameSeverity.includes("medio") || nameSeverity.includes("média")) return "text-alert-medium border-alert-medium/30 bg-alert-medium/10";
    if (nameSeverity.includes("baixo") || nameSeverity.includes("seguro") || nameSeverity.includes("baixa")) return "text-alert-low border-alert-low/30 bg-alert-low/10";
    return "text-alert-info border-alert-info/30 bg-alert-info/10";
};

const getSeverityBorderColor = (severity: string) => {
    const nameSeverity = severity.toLowerCase();
    if (nameSeverity.includes("crítico") || nameSeverity.includes("critico") || nameSeverity.includes("crítica")) return "border-l-6 border-l-alert-critical";
    if (nameSeverity.includes("alto") || nameSeverity.includes("alta")) return "border-l-6 border-l-alert-high";
    if (nameSeverity.includes("médio") || nameSeverity.includes("medio") || nameSeverity.includes("média")) return "border-l-6 border-l-alert-medium";
    if (nameSeverity.includes("baixo") || nameSeverity.includes("seguro") || nameSeverity.includes("baixa")) return "border-l-6 border-l-alert-low";
    return "border-alert-info bg-alert-info";
};

const getSeverityWeight = (severity: string): number => {
    const nameSeverity = severity.toLowerCase();
    if (nameSeverity.includes("crítico") || nameSeverity.includes("critico") || nameSeverity.includes("crítica")) return 4;
    if (nameSeverity.includes("alto") || nameSeverity.includes("alta")) return 3;
    if (nameSeverity.includes("médio") || nameSeverity.includes("medio") || nameSeverity.includes("média")) return 2;
    if (nameSeverity.includes("baixo") || nameSeverity.includes("baixa")) return 1;
    return 0; // seguro, info, outros
};

interface PainelProps {
    headers: HeaderScanResult[];
    resumo: string;
}

const Painel = ({ headers, resumo }: PainelProps) => {
    const sortedHeaders = [...headers].sort((a, b) => getSeverityWeight(b.severidade) - getSeverityWeight(a.severidade));
    
    return (
        <div className="w-full mt-8">
            <h2 className="text-xl font-bold mb-4">Headers Analisados</h2>
            <p className="text-sm text-slate-400 mb-6">{resumo}</p>

            <div className="space-y-3">
                {sortedHeaders.map((header: HeaderScanResult, idx: number) => (
                    <div key={idx} className={`p-4 bg-[#0d1527] border border-slate-800 ${getSeverityBorderColor(header.severidade)} rounded-lg flex justify-between items-center hover:border-slate-800 transition-all duration-300`}>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-slate-200">{header.nome}</h3>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getSeverityColor(header.severidade)}`}>
                                    {header.severidade.toUpperCase()}
                                </span>
                                <span className="text-[10px] rounded px-2 py-0.5 font-medium bg-slate-800/60 border border-slate-700">STATUS: {header.status.toUpperCase()}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{header.recomendacao}</p>
                            <div className="flex-row mt-4 bg-slate-800/60 rounded p-2 border border-slate-700">
                                <h5 className="text-xs text-white font-medium">VALOR ATUAL</h5>
                                <h6 className={`text-xs mt-1 text-alert-info`}>{header.valor_atual || "null"}</h6>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Painel;
