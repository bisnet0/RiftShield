import bcrypt from "bcrypt";
import { User } from "../models/user-model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../../shared/utils/token.js";
import { AppError, UnauthorizedError } from "../../../shared/utils/errors.js";
import type { RegisterInput, LoginInput } from "../validators/auth-validator.js";

const MASTER_KEY = process.env.MASTER_KEY || "riftshield-master-key";

export async function registerUser(data: RegisterInput) {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new AppError("E-mail já cadastrado", 409);
  }

  if (data.masterKey && data.masterKey !== MASTER_KEY) {
    throw new AppError("Chave-mestre inválida", 403);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    phone: data.phone,
    country: data.country,
    state: data.state,
    city: data.city,
  });

  const tokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      country: user.country,
      state: user.state,
      city: user.city,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function loginUser(data: LoginInput) {
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) {
    throw new UnauthorizedError("E-mail ou senha inválidos");
  }

  const passwordMatch = await bcrypt.compare(data.password, user.password);
  if (!passwordMatch) {
    throw new UnauthorizedError("E-mail ou senha inválidos");
  }

  const tokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      country: user.country,
      state: user.state,
      city: user.city,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(token: string) {
  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);

    if (!user || user.refreshToken !== token) {
      throw new UnauthorizedError("Refresh token inválido");
    }

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError("Refresh token inválido ou expirado");
  }
}

export async function logoutUser(userId: string) {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
}

export async function getProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    country: user.country,
    state: user.state,
    city: user.city,
    role: user.role,
    createdAt: user.createdAt,
  };
}
