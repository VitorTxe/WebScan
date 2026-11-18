import express from 'express';
import cors from 'cors';
import scanRoutes from "./routes/scan.routes.js";

const app = express();

// Necessário atrás de proxy reverso (ex.: Render) para identificar o IP real via X-Forwarded-For
app.set('trust proxy', 1);

const allowedOrigins = ["http://localhost:5173", "http://localhost", "http://localhost:80"];

if (process.env.FRONTEND_URL) {
    // Remove a barra final '/' caso tenha sido inserida na variável de ambiente
    const cleanUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
    allowedOrigins.push(cleanUrl);
}

const corsOptions = cors({
    origin: allowedOrigins
});

app.use(express.json());

app.use(corsOptions);

app.use(scanRoutes);

app.listen(3000, () => {
    console.log("Servidor está rodando na porta 3000");
});
