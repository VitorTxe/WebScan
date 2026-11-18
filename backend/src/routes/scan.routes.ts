import { Router } from "express";
import { scanController } from "../controller/scan.controller.js";
import { scanIdController } from "../controller/scanId.controller.js";
import { health } from "../controller/health.controller.js";
import { scanCreateLimiter, scanStatusLimiter } from "../middlewares/rateLimit.js";

const scanRoutes: Router = Router();

scanRoutes.post("/scan", scanCreateLimiter, scanController);
scanRoutes.get("/scan/:jobId", scanStatusLimiter, scanIdController);
scanRoutes.get("/health", health);

export default scanRoutes;

