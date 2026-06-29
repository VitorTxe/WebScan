import { useState, useEffect } from "react";
import axios from "axios";
import { startScan } from "../service/server";
import { type ScanResponse } from "../types/scan";

// Função auxiliar pura declarada fora do Hook
function validateUrl(urlString: string): void {
    try {
        const parsedUrl = new URL(urlString);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            throw new Error("A URL deve começar com http:// ou https://");
        }
    } catch {
        throw new Error("URL inválida. Certifique-se de incluir o protocolo (ex: https://exemplo.com)");
    }
}

export function useScan(url: string) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Efeito para limpar o erro automaticamente após 5 segundos
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000); // 5000ms = 5 segundos

            // Limpa o timer se o erro mudar ou o componente desmontar
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleScan = async (): Promise<ScanResponse | null> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const trimmedUrl = url.trim();
            validateUrl(trimmedUrl);
            const response = await startScan(trimmedUrl);
            return response;
        } catch (err: unknown) {
            let errorMessage = "Erro desconhecido ao iniciar a varredura";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            setError(errorMessage);
            console.error("Erro no Hook useScan:", err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, error, handleScan };
}

