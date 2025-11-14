import jwt from "jsonwebtoken";

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
} 