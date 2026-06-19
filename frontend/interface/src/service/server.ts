import axios from "axios";
import { type ScanStatusResponse } from "../types/scan";

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: `${API_URL}`,
    headers: {
        "Content-Type": "application/json",
    },
});

export const ScanService = async(id: string): Promise<ScanStatusResponse> => {
    try {
        const response = await api.get(`/${id}`)
        return response.data;
    } catch (error) {
        console.error("Erro na chamada da API:", error);
        throw error;
    }
}