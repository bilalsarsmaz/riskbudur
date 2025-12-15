import { NextResponse } from "next/server";

export async function GET() {
    const { GOOGLE_CLIENT_ID, NEXT_PUBLIC_APP_URL } = process.env;
    const baseUrl = NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json(
            { error: "Google Client ID is missing" },
            { status: 500 }
        );
    }

    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    // Scopes: profile and email
    const scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    return NextResponse.redirect(googleAuthUrl);
}
