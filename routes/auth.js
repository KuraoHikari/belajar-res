import exp from "express";

const authRoutes = exp.Router();

import { login, register } from "../controllers/auth.js";

authRoutes.post("/login", login);
authRoutes.post("/register", register);

export default authRoutes;
