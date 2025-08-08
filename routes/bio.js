import exp from "express";

const bioRoutes = exp.Router();

import { createBio } from "../controllers/bio.js";
import authenticateTokenMiddleware from "../middleware/authenticateToken.js";

bioRoutes.post("/", authenticateTokenMiddleware, createBio);

export default bioRoutes;
