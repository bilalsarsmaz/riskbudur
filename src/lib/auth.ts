import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

/**
 * Verify token AND update user's lastSeen timestamp
 * Use this in API endpoints to automatically track user activity
 */
export async function verifyTokenAndUpdateActivity(token: string) {
  const decoded = await verifyToken(token);

  if (decoded?.userId) {
    // Throttle Update: Only update if lastSeen is older than 2 minutes
    // This dramatically reduces database write load
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    prisma.user.updateMany({
      where: {
        id: decoded.userId,
        // Only update if lastSeen is null OR older than 2 mins
        OR: [
          { lastSeen: { lt: twoMinutesAgo } },
          { lastSeen: null }
        ]
      },
      data: { lastSeen: new Date() }
    }).catch(err => console.error("LastSeen update error:", err));
  }

  return decoded;
}

export async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = await verifyTokenAndUpdateActivity(token);
  return decoded?.userId || null;
} 