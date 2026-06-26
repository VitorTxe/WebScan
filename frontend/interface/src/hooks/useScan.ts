import { useState } from "react";
import { startScan } from "../service/server";
import { type ScanResponse } from "../types/scan";

export function useScan(url: string) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async (): Promise<ScanResponse | null> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await startScan(url);
            return response;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao iniciar a varredura";
            setError(errorMessage);
            console.error("Erro no Hook useScan:", err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, error, handleScan };
}

