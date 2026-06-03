import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { authRoutes } from "./modules/auth/index.js";
import { userRoutes } from "./modules/users/index.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

connectDatabase().then(() => {
  app.listen(env.port, () => {
    console.log(`🚀 Servidor rodando na porta ${env.port}`);
  });
});
