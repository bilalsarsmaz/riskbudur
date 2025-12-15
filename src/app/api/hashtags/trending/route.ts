import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // 7 gunden eski ve inaktif hashtagleri temizle
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Opsiyonel: Sadece hicbir postu kalmayanlari mi silelim? 
    // Kullanici "inaktif" dedi. Yani kimse yazmiyorsa.
    // Eger 7 gundur guncellenmediyse (yeni post atilmadiysa) silinsin.
    // Ancak eski postlarda bu hashtag hala var olabilir.
    // Eger silersek, eski postlardan da hashtag bagi kopar mi?
    // Prisma'da Cascade delete olmadigi surece kopmaz, ama Hashtag tablosundan silinince PostHashtag iliskisi bozulabilir.
    // Genellikle Hashtag tablosu bir "indeks" gibidir.
    // Eger kullanici "kimse artik yazmiyorsa" diyorsa, bu "yeni post gelmiyorsa" demektir.
    // Eski postlarda kalsin mi? "Silinsin" dedi. Baglantiyi koparabiliriz veya onlari da temizlemeliyiz?
    // Basitlik adina: Hashtag'i silersek, Post'lardaki referansi siliyoruz demektir.
    // Implicit many-to-many iliskide bu tabloyu silmek iliskileri de siler (cascade).
    // Evet, Prisma implicit m-n iliskide join tablosunu temizler.

    await prisma.hashtag.deleteMany({
      where: {
        updatedAt: {
          lt: sevenDaysAgo
        }
      }
    });

    const hashtags = await prisma.hashtag.findMany({
      take: limit,
      where: {
        posts: {
          some: {}
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    const formattedHashtags = hashtags.map(h => ({
      id: h.id,
      name: h.name,
      count: h._count.posts
    }));

    return NextResponse.json({ hashtags: formattedHashtags });
  } catch (error) {
    console.error("Trending hashtag hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
