import express, { type Request, type Response } from 'express';
import { json } from 'node:stream/consumers';
import { analyzeHeadersWithAi } from './services/securityAiAnalyzer.js';

const app = express();
app.use(express.json())


app.post("/scan", async (req:Request, res:Response):Promise<void> => {
    try {
        const {url} = req.body;
        const result = await analyzeHeadersWithAi(url);

        res.status(200).json({result})
    } catch (error) {
        console.error("Erro ao processar scan:",error)
        res.status(500).json({error:"Erro ao processar scan"})
    }
})

app.listen(3000, () => {
    console.log("Servidor está rodando na porta 3000")
})

