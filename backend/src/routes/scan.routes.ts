import { Router } from "express";
import { scanController } from "../controller/scan.controller.js";
import { scanIdController } from "../controller/scanId.controller.js";
import { health } from "../controller/health.controller.js"

const scanRoutes: Router = Router();

scanRoutes.post("/scan", scanController);
scanRoutes.get("/scan/:jobId", scanIdController);
scanRoutes.get("/health", health);

export default scanRoutes;

