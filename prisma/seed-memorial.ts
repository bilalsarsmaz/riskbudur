import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const profiles = [
    {
        nickname: 'yumuklusucurta',
        fullName: 'Yumuklu Sucurta',
    },
    {
        nickname: 'noctis',
        fullName: 'Noctis',
    },
    {
        nickname: 'meczupbalik',
        fullName: 'Meczup Balık',
    },
];

const main = async () => {
    console.log('Seedleme işlemi başlıyor...');

    for (const profile of profiles) {
        const bio = `Bu profil @${profile.nickname} anısına oluşturulmuştur. Ruhu şad olsun.`;

        // Rastgele bir şifre hash'i (aslında hash değil ama gerekirse bcrypt kullanmayacağız, dummy string yeterli şimdiliklogin olmayacaklar)
        const dummyPassword = "$2b$10$NotRealHashButValidFormatMaybeOrJustString";

        const email = `${profile.nickname}@riskbudur.net`; // Dummy email

        try {
            await prisma.user.upsert({
                where: { nickname: profile.nickname },
                update: {
                    bio: bio,
                    profileImage: '/Riskbudur-first.png',
                },
                create: {
                    nickname: profile.nickname,
                    fullName: profile.fullName,
                    email: email,
                    password: dummyPassword,
                    bio: bio,
                    profileImage: '/Riskbudur-first.png',
                    isApproved: true,
                    isSetupComplete: true,
                    coverImage: '/rb-cover.png'
                },
            });
            console.log(`${profile.nickname} oluşturuldu/güncellendi.`);
        } catch (e) {
            console.error(`${profile.nickname} için hata:`, e);
        }
    }

    console.log('Seedleme tamamlandı.');
};

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
