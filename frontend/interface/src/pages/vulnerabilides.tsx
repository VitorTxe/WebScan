import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getScanStatus } from "../service/server";
import { type ScanStatusResponse } from "../types/scan";
import Painel from "../components/Painel";
import Cards from "../components/Cards";

const Vulnerabilidades = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    // Inicializa com o estado da navegação se disponível
    const stateData = location.state?.scanData as ScanStatusResponse | undefined;

    // Inicializa os estados calculando o valor inicial para evitar setStates síncronos
    const [data, setData] = useState<ScanStatusResponse | null>(stateData || null);
    const [isLoading, setIsLoading] = useState<boolean>(!(stateData && stateData.status === "completed"));
    const [progress, setProgress] = useState<number>(stateData?.progress || 0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Se já temos os dados (vindos da navegação anterior) e a varredura está concluída, não fazemos nada
        if (stateData && stateData.status === "completed") return
        if (!jobId) return;

        let isMounted = true;
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const pollScanStatus = async () => {
            try {
                const response = await getScanStatus(jobId);
                if (!isMounted) return;

                setProgress(response.progress);

                if (response.status === "completed") {
                    setData(response);
                    setIsLoading(false);
                    if (intervalId) clearInterval(intervalId);
                } else if (response.status === "failed") {
                    setError(response.error || "A varredura falhou no servidor.");
                    setIsLoading(false);
                    if (intervalId) clearInterval(intervalId);
                }
            } catch (err: unknown) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Erro ao carregar os dados da varredura.");
                setIsLoading(false);
                if (intervalId) clearInterval(intervalId);
            }
        };

        // Executa a primeira busca imediatamente
        pollScanStatus();

        // Inicia o polling a cada 1 segundo
        intervalId = setInterval(pollScanStatus, 1000);

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [jobId, stateData]);

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 text-center">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800/80 p-6 rounded-2xl space-y-5 shadow-xl shadow-rose-950/10">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Erro na Varredura</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {error}
                    </p>
                    <button 
                        onClick={() => navigate("/")}
                        className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 font-semibold rounded-xl transition duration-200 cursor-pointer text-sm"
                    >
                        Voltar para o Início
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading || !data || !data.result) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 space-y-8">
                {/* Header Skeleton */}
                <div className="space-y-3 animate-pulse">
                    <div className="h-7 w-64 bg-slate-900 rounded-md"></div>
                    <div className="h-4 w-96 bg-slate-900/60 rounded-md"></div>
                </div>

                {/* Real-time Progress Bar */}
                <div className="max-w-2xl bg-slate-900 border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-lg shadow-cyan-500/5">
                    <div className="flex justify-between text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                        <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
                            Análise de segurança em andamento...
                        </span>
                        <span className="font-mono">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                        <div 
                            className="h-full bg-linear-to-r from-cyan-500 to-indigo-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 italic">
                        Mapeando cabeçalhos HTTP, analisando políticas de segurança e gerando recomendações...
                    </p>
                </div>

                {/* Cards Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 space-y-4 animate-pulse">
                            <div className="flex justify-between items-center">
                                <div className="h-5 w-28 bg-slate-800 rounded-md"></div>
                                <div className="h-6 w-12 bg-slate-800/80 rounded-full"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-slate-800/50 rounded-md"></div>
                                <div className="h-3 w-3/4 bg-slate-800/30 rounded-md"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Painel Skeleton */}
                <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-6 space-y-6 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-40 bg-slate-800 rounded-md"></div>
                        <div className="h-4 w-20 bg-slate-800/50 rounded-md"></div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-slate-800/40 gap-3">
                                <div className="space-y-2 w-full sm:w-1/3">
                                    <div className="h-4 w-3/4 bg-slate-800 rounded-md"></div>
                                    <div className="h-3 w-1/2 bg-slate-800/50 rounded-md"></div>
                                </div>
                                <div className="h-3 w-full sm:w-1/2 bg-slate-800/30 rounded-md"></div>
                                <div className="h-6 w-16 bg-slate-800/70 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
            <header className="mb-5">
                <h1 className="text-2xl font-bold tracking-wider uppercase text-slate-300">
                    Painel de Vulnerabilidades
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Status e severidade dos alertas de segurança identificados.
                </p>
            </header>

            <Cards headers={data.result.headers} />
            <Painel headers={data.result.headers} resumo={data.result.resumo} />
        </div>
    );
};

export default Vulnerabilidades;