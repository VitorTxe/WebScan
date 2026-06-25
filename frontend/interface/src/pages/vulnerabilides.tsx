import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getScanStatus } from "../service/server";
import { type ScanStatusResponse } from "../types/scan";
import Painel from "../components/Painel";
import Cards from "../components/Cards";

const Vulnerabilidades = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const location = useLocation();

    // Inicializa com o estado da navegação se disponível
    const stateData = location.state?.scanData as ScanStatusResponse | undefined;

    // Inicializa os estados calculando o valor inicial para evitar setStates síncronos
    const [data, setData] = useState<ScanStatusResponse | null>(stateData || null);
    const [isLoading, setIsLoading] = useState<boolean>(!(stateData && stateData.status === "completed"));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Se já temos os dados (vindos da navegação anterior) e a varredura está concluída, não fazemos nada
        if (stateData && stateData.status === "completed") return;

        if (!jobId) return;
        
        let isMounted = true;

        const fetchScanData = async () => {
            try {
                const response = await getScanStatus(jobId);
                
                if (isMounted) {
                    setData(response);
                    setError(null);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Erro ao carregar os dados da varredura.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        fetchScanData();

        return () => { isMounted = false; };

    }, [jobId, stateData]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#070b19] text-cyan-400">
                <span>Realizando varredura...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#070b19] text-rose-500">
                <span>Ocorreu um erro: {error}</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#070b19] text-slate-400">
                <span>Nenhum dado encontrado para esta varredura.</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070b19] text-slate-100 p-6 md:p-12">
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