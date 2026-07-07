import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import './queue/scanWorker.js'; // Inicializa o worker em segundo plano
import scanRoutes from "./routes/scan.routes.js"

const app = express();

// Limita o número de requisições por IP na janela de tempo
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos em milissegundos
    max: 50, // Limite de 5 requisições a cada 5 minutos por IP
    message: 'Muitas requisições foram feitas, tente novamente mais tarde.'
});

const corsOptions = cors({
    origin: ["http://localhost:5173", "https://webscan-interface.up.railway.app"]
});

app.use(express.json());

app.use(corsOptions);

app.use(limiter);

app.use(scanRoutes);

app.listen(3000, () => {
    console.log("Servidor está rodando na porta 3000");
});
