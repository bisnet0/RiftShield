import { type Request, type Response, type NextFunction } from "express";
import { registerSchema, loginSchema } from "../validators/auth-validator.js";
import * as authService from "../services/auth-service.js";
import type { AuthRequest } from "../../../middleware/auth.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.registerUser(data);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth",
    });

    res.status(201).json({ user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginUser(data);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth",
    });

    res.json({ user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ error: "Refresh token não fornecido" });
      return;
    }

    const result = await authService.refreshTokens(token);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth",
    });

    res.json({ message: "Tokens renovados" });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user?.id) {
      await authService.logoutUser(req.user.id);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await authService.getProfile(req.user!.id);
    res.json({ user: profile });
  } catch (err) {
    next(err);
  }
}
