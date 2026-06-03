import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../shared/utils/errors.js";
import { ZodError } from "zod";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => e.message).join(", ");
    res.status(400).json({ error: messages });
    return;
  }

  console.error("Erro não tratado:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
}
