import { type Request, type Response, type NextFunction } from "express";
import { verifyAccessToken } from "../shared/utils/token.js";
import { UnauthorizedError } from "../shared/utils/errors.js";
import { User } from "../modules/auth/models/user-model.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new UnauthorizedError("Token não fornecido"));
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      return next(new UnauthorizedError("Usuário não encontrado"));
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch {
    next(new UnauthorizedError("Token inválido ou expirado"));
  }
}
