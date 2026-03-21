import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import prisma from "../utils/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    username: string;
    fullName: string;
    teamId: string | null;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findFirst({
      where: { id: payload.userId, deletedAt: null },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      fullName: user.fullName,
      teamId: user.teamId,
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
