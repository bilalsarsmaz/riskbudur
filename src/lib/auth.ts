import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = await verifyToken(token);
  return decoded?.userId || null;
} 