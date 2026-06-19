import { useScan } from "../hooks/useScan";
import { type FC } from "react"
import { type HeaderScanResult } from "../types/scan";

const Painel: FC<HeaderScanResult> = ({nome, status, severidade, valor_atual, recomendacao}) => {
    const { data } = useScan("15");
    return (
        <div className="flex justify-center items-center h-screen w-full">
            {data.}
        </div>
    );
};

export default Painel
