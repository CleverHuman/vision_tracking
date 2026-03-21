import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../utils/prisma";
import { AppError } from "../utils/app-error";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { AuthRequest } from "../middleware/auth.middleware";

function sanitizeUser(user: any) {
  const { passwordHash, refreshToken, deletedAt, ...safe } = user;
  return safe;
}

export async function register(req: Request, res: Response) {
  const { email, username, password, fullName, role, sport } = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    const field = existing.email === email ? "Email" : "Username";
    throw new AppError(`${field} already taken.`, 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      fullName,
      role: role || "ANALYST",
      sport: sport || null,
    },
    include: { team: true },
  });

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh },
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username: email }],
      deletedAt: null,
    },
    include: { team: true },
  });

  if (!user) {
    throw new AppError("Invalid credentials.", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid credentials.", 401);
  }

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh },
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  });
}

export async function refresh(req: Request, res: Response) {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (!token) {
    throw new AppError("Refresh token required.", 401);
  }

  const payload = verifyRefreshToken(token);

  const user = await prisma.user.findFirst({
    where: { id: payload.userId, deletedAt: null },
    include: { team: true },
  });

  if (!user || !user.refreshToken) {
    throw new AppError("Invalid refresh token.", 401);
  }

  const valid = await bcrypt.compare(token, user.refreshToken);
  if (!valid) {
    // Token reuse detected — clear all sessions
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });
    throw new AppError("Token reuse detected. Please log in again.", 401);
  }

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh },
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    user: sanitizeUser(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
}

export async function logout(req: AuthRequest, res: Response) {
  if (req.user) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });
  }

  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully." });
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findFirst({
    where: { id: req.user!.id, deletedAt: null },
    include: {
      team: {
        include: { organization: true },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  res.json({ user: sanitizeUser(user) });
}
