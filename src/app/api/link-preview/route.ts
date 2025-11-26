import { NextRequest, NextResponse } from "next/server";

interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  siteName: string;
  type: "youtube" | "video" | "link";
  videoId?: string;
}

// YouTube video ID'sini URL'den çıkar
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// YouTube oEmbed API'den metadata çek
async function fetchYouTubeMetadata(videoId: string, url: string): Promise<LinkPreviewData | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    return {
      url: url,
      title: data.title || "YouTube Video",
      description: data.author_name ? `${data.author_name} tarafından` : "",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      siteName: "YouTube",
      type: "youtube",
      videoId: videoId,
    };
  } catch (error) {
    console.error("YouTube metadata fetch error:", error);
    return null;
  }
}

// Genel Open Graph metadata çek
async function fetchOpenGraphMetadata(url: string): Promise<LinkPreviewData | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkPreviewBot/1.0)",
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Open Graph meta tag'lerini parse et
    const getMetaContent = (property: string): string => {
      const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, "i");
      const altRegex = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, "i");
      const match = html.match(regex) || html.match(altRegex);
      return match ? match[1] : "";
    };
    
    const title = getMetaContent("og:title") || getMetaContent("twitter:title") || "";
    const description = getMetaContent("og:description") || getMetaContent("twitter:description") || "";
    const thumbnail = getMetaContent("og:image") || getMetaContent("twitter:image") || "";
    const siteName = getMetaContent("og:site_name") || new URL(url).hostname;
    
    if (!title && !thumbnail) {
      return null;
    }
    
    return {
      url: url,
      title: title,
      description: description,
      thumbnail: thumbnail,
      siteName: siteName,
      type: "link",
    };
  } catch (error) {
    console.error("Open Graph metadata fetch error:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL gerekli" }, { status: 400 });
    }
    
    // URL'yi validate et
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Geçersiz URL" }, { status: 400 });
    }
    
    // YouTube linki mi kontrol et
    const youtubeVideoId = extractYouTubeVideoId(url);
    
    if (youtubeVideoId) {
      const metadata = await fetchYouTubeMetadata(youtubeVideoId, url);
      if (metadata) {
        return NextResponse.json(metadata);
      }
    }
    
    // Diğer linkler için Open Graph metadata çek
    const metadata = await fetchOpenGraphMetadata(url);
    if (metadata) {
      return NextResponse.json(metadata);
    }
    
    // Metadata bulunamadı, basit response dön
    return NextResponse.json({
      url: url,
      title: parsedUrl.hostname,
      description: "",
      thumbnail: "",
      siteName: parsedUrl.hostname,
      type: "link",
    });
    
  } catch (error) {
    console.error("Link preview error:", error);
    return NextResponse.json({ error: "Link önizleme alınamadı" }, { status: 500 });
  }
}
