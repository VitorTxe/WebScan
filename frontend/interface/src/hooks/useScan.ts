import { useState } from "react";
import { ScanService } from "../service/server";
import { type ScanStatusResponse } from "../types/scan";

export function useScan(id: string) {
    const [data, setData] = useState<ScanStatusResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await ScanService(id);
            setData(response);
            console.log("Dados recebidos da API:", response);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao realizar a varredura";
            setError(errorMessage);
            console.error("Erro no Hook useScan:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, isLoading, error, handleScan };
}

