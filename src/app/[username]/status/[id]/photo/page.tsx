import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { IconX } from "@tabler/icons-react";
import { notFound } from "next/navigation";
import PostItem from "@/components/PostItem";

// Force dynamic rendering since we are fetching data
export const dynamic = 'force-dynamic';

interface PhotoPageProps {
    params: {
        username: string;
        id: string;
    };
}

export default async function PhotoPage({ params }: PhotoPageProps) {
    const { username, id } = params;

    // 1. Fetch the post to get the image URL
    const post = await prisma.post.findUnique({
        where: { id: id },
        include: {
            author: true,
            _count: {
                select: {
                    likes: true,
                    comments: true,
                    quotes: true,
                    replies: true,
                },
            },
        },
    });

    if (!post || !post.imageUrl) {
        return notFound();
    }

    // Verify username matches (optional but good for SEO/Canonical URLs)
    if (post.author.nickname !== username) {
        return notFound();
    }

    return (
        <div className="flex h-screen w-full bg-black overflow-hidden relative">

            {/* Close Button - Returns to Post Status Page */}
            <Link
                href={`/${username}/status/${id}`}
                className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
                <IconX size={24} />
            </Link>

            {/* Left Side: Image Canvas */}
            <div className="flex-1 flex items-center justify-center bg-black relative">
                <div className="relative w-full h-full p-4">
                    {/* Use standard img tag for flexibility with various sizes/aspect ratios without complex next/image config for uploads */}
                    <img
                        src={post.imageUrl}
                        alt="Post photo"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>

            {/* Right Side: Sidebar (Optional - mimics X desktop theater mode) */}
            {/* 
         For mobile: this could be hidden or a bottom sheet. 
         For now, we will just show the image as the user requested "Galeri Modu". 
         If they want the sidebar (comments etc), we can add it later.
         But typically X photo view has a sidebar on desktop.
      */}
            <div className="hidden lg:flex w-[350px] border-l border-[#2F3336] flex-col overflow-y-auto bg-black">
                {/* Reuse PostItem? Or custom minimal view? 
              Ideally we render the PostItem here but without the media (since it's on the left).
              But PostItem is complex. Let's just link back for now or show basic info.
          */}
                <div className="p-4">
                    {/* 
                  Since PostItem is a client component wrapper usually, verifying if we can reuse it directly.
                  For now, let's keep it simple: Image Focus.
                  If User wants Sidebar, we will add it in next iteration.
               */}
                    <h2 className="text-xl font-bold mb-4 text-[#e7e9ea]">Gönderi</h2>
                    {/* We can construct a minimal Post Item view manually or try to reuse PostItem 
                   Note: PostItem expects EnrichedPost. Our 'post' fetch above might need mapping.
               */}
                </div>
            </div>
        </div>
    );
}
