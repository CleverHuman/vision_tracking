import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { Prisma } from "@prisma/client";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A record with that value already exists." });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found." });
    }
  }

  if (err instanceof TokenExpiredError) {
    return res.status(401).json({ error: "Token has expired." });
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({ error: "Invalid token." });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error." });
}
