import { useEffect, useState } from "react";
import { getScanStatus } from "../service/server";
import { type ScanStatusResponse } from "../types/scan";

export function useScanStatus(jobId: string | undefined, initialState?: ScanStatusResponse) {
    const [data, setData] = useState<ScanStatusResponse | null>(initialState || null);
    const [isLoading, setIsLoading] = useState<boolean>(!(initialState && initialState.status === "completed"));
    const [progress, setProgress] = useState<number>(initialState?.progress || 0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialState && initialState.status === "completed") return;
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
                console.error("[useScanStatus Error]:", err);
                setError(err instanceof Error ? err.message : "Erro ao carregar os dados da varredura.");
                setIsLoading(false);
                if (intervalId) clearInterval(intervalId);
            }
        };

        // Executa a primeira busca imediatamente
        pollScanStatus();

        // Polling contínuo a cada 1 segundo
        intervalId = setInterval(pollScanStatus, 1000);

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [jobId, initialState]);

    return { data, isLoading, progress, error };
}
