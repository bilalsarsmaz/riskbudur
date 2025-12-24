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

// In-memory cache to throttle database writes (resets on server restart)
const lastSeenCache = new Map<string, number>();
const THROTTLE_DELAY = 60 * 1000; // 1 minute

/**
 * Verify token AND update user's lastSeen timestamp
 * Use this in API endpoints to automatically track user activity
 */
export async function verifyTokenAndUpdateActivity(token: string) {
  const decoded = await verifyToken(token);

  if (decoded?.userId) {
    const now = Date.now();
    const lastUpdate = lastSeenCache.get(decoded.userId) || 0;

    // Only hit the database if 1 minute has passed since last update
    if (now - lastUpdate > THROTTLE_DELAY) {
      // Update cache immediately
      lastSeenCache.set(decoded.userId, now);

      // Memory safety: Clear cache if it gets too large (e.g. > 10k active users)
      if (lastSeenCache.size > 10000) {
        lastSeenCache.clear();
        lastSeenCache.set(decoded.userId, now);
      }

      // Update database asynchronously
      prisma.user.update({
        where: { id: decoded.userId },
        data: { lastSeen: new Date() }
      }).catch(err => console.error("LastSeen update error:", err));
    }
  }

  return decoded;
}

export async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = await verifyTokenAndUpdateActivity(token);
  return decoded?.userId || null;
} 