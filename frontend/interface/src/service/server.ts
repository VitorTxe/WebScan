import axios from "axios";
import { type ScanStatusResponse, type ScanResponse } from "../types/scan";

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const startScan = async (urlToScan: string): Promise<ScanResponse> => {
    try {
        const response = await api.post<ScanResponse>("/scan", { url: urlToScan });
        return response.data;
    } catch (error) {
        console.error("Erro ao iniciar a varredura:", error);
        throw error;
    }
};

export const getScanStatus = async (jobId: string): Promise<ScanStatusResponse> => {
    const response = await api.get<ScanStatusResponse>(`/scan/${jobId}`);
    return response.data;
};