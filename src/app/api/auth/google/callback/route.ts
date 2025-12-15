import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(new URL("/login?error=google_auth_failed", req.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=no_code", req.url));
    }

    try {
        const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_APP_URL, JWT_SECRET } = process.env;
        const baseUrl = NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const redirectUri = `${baseUrl}/api/auth/google/callback`;

        // 1. Exchange code for access token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID!,
                client_secret: GOOGLE_CLIENT_SECRET!,
                code,
                grant_type: "authorization_code",
                redirect_uri: redirectUri,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error("Google Token Error:", tokenData);
            return NextResponse.redirect(new URL("/login?error=token_exchange_failed", req.url));
        }

        // 2. Get User Info
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
            console.error("Google User Info Error:", userData);
            return NextResponse.redirect(new URL("/login?error=user_info_failed", req.url));
        }

        // 3. Find or Create User
        let user = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            // Generate a standard temp nickname
            const tempNickname = `user_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

            user = await prisma.user.create({
                data: {
                    email: userData.email,
                    fullName: userData.name,
                    nickname: tempNickname,
                    profileImage: userData.picture, // Google picture
                    isSetupComplete: false
                }
            });
        }

        // 4. Generate Session Token
        const userAny = user as any; // Cast because types might not be generated yet
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, isSetupComplete: userAny.isSetupComplete },
            JWT_SECRET!,
            { expiresIn: "365d" }
        );

        // 5. Create Response & Set Cookie
        // We need to redirect to a page that will set the localStorage.
        // Since we can't set localStorage from Server Side, we will redirect to a special 'auth-sync' page or handle it on the destination.
        // A common pattern: Redirect to /home or /setup with token in query param? No, insecure.
        // Better: Set HTTPOnly cookie here, and client reads user info from /users/me or similar.
        // BUT our frontend `page.tsx` checks `localStorage`.
        // Strategy: We will redirect to `/google-callback?token=...` which is a temporary client page that saves token to localstorage and then redirects to home/setup.

        const response = NextResponse.redirect(new URL("/google-callback-handler?token=" + token + "&setup=" + userAny.isSetupComplete, req.url));

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
        });

        return response;

    } catch (err) {
        console.error("Callback Error:", err);
        return NextResponse.redirect(new URL("/login?error=server_error", req.url));
    }
}
