import axios from "axios";
import { type ScanStatusResponse, type ScanResponse } from "../types/scan";

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const ScanService = async (urlToScan: string): Promise<ScanStatusResponse> => {
    try {
        // Envia a URL no corpo da requisição para o endpoint /scan do nosso servidor backend
        // const requestData: ScanRequest = { url: urlToScan };
        const postResponse = await api.post<ScanResponse>("/scan", { url: urlToScan });
        const { jobId } = postResponse.data;
        console.log("Varredura iniciada! Job ID:", jobId);

        //  Faz polling no endpoint /scan/:jobId até que o status seja concluído ou falhe
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const getResponse = await api.get<ScanStatusResponse>(`/scan/${jobId}`);
                    const scanStatus = getResponse.data;
                    console.log(`Status do Job ${jobId}: ${scanStatus.status} (${scanStatus.progress}%)`);

                    if (scanStatus.status === "completed") {
                        clearInterval(interval);
                        resolve(scanStatus);
                    } else if (scanStatus.status === "failed") {
                        clearInterval(interval);
                        reject(new Error(scanStatus.error || "A varredura falhou no servidor."));
                    }
                } catch (error) {
                    clearInterval(interval);
                    reject(error);
                }
            }, 1000); // Verifica a cada 1 segundo
        });
    } catch (error) {
        console.error("Erro na chamada da API:", error);
        throw error;
    }
};

export const getScanStatus = async (jobId: string): Promise<ScanStatusResponse> => {
    const response = await api.get<ScanStatusResponse>(`/scan/${jobId}`);
    return response.data;
};