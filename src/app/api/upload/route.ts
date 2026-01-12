import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifyTokenAndUpdateActivity } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        // 1. Authorization Check
        const token = req.headers.get("authorization")?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyTokenAndUpdateActivity(token);
        if (!decoded) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        // 2. Parse FormData
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file provided" }, { status: 400 });
        }

        // 3. Validation (Type & Size)
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB
            return NextResponse.json({ message: "File too large (Max 50MB)" }, { status: 400 });
        }

        // 4. Generate Unique Filename
        const buffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}-${randomSuffix}.${extension}`;

        // 5. Ensure Directory Exists
        const uploadDir = path.join(process.cwd(), "public", "uploads", "posts");

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        // 6. Save File
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // 7. Return URL
        const publicUrl = `/uploads/posts/${filename}`;

        return NextResponse.json({
            url: publicUrl,
            type: file.type.startsWith('video/') ? 'video' : 'image'
        }, { status: 201 });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Upload failed" }, { status: 500 });
    }
}
