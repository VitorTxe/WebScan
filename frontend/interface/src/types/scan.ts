export interface HeaderScanResult {
    nome: string;
    status: 'ausente' | 'presente';
    severidade: 'crítica' | 'alta' | 'média' | 'baixa';
    valor_atual: string | null;
    recomendacao: string;
}

export interface SecurityAnalysisResult {
    headers: HeaderScanResult[];
    resumo: string;
    score: number;
}

export interface ScanStatusResponse {
    jobId: string;
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown';
    progress: number;
    result: SecurityAnalysisResult | null;
    error: string | null;
}
