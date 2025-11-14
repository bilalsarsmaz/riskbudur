# 🚀 Nown - Anonim Mikroblog Platformu

Nown, kullanıcıların anonim olarak düşüncelerini paylaşabilecekleri modern bir mikroblog platformudur.

## ✨ Teknolojiler

- **Next.js 15** - React 19 + App Router
- **TypeScript** - Type-safe kod
- **Prisma ORM** - Database management
- **PostgreSQL 16** - Self-hosted, güçlü ve güvenli
- **Tailwind CSS 4** - Modern styling
- **PM2** - Production process manager
- **Nginx** - Reverse proxy + SSL

## 🚀 Hızlı Başlangıç (Production - DigitalOcean)

### TEK KOMUTLA DEPLOYMENT! ⚡

```bash
sudo bash deployment/deploy-standalone.sh
```

**15 dakikada hazır!** Detaylı rehber: [`deployment/README-STANDALONE.md`](deployment/README-STANDALONE.md)

**Ne kuruluyor?**
- ✅ Node.js, PostgreSQL, Nginx
- ✅ SSL sertifikası (Let's Encrypt)
- ✅ Otomatik database setup
- ✅ PM2 ile production başlatma
- ✅ Firewall + güvenlik

---

## 💻 Local Development

### 1. Projeyi klonlayın:
```bash
git clone https://github.com/yourusername/nown.git
cd nown
```

### 2. Bağımlılıkları yükleyin:
```bash
npm install
```

### 3. PostgreSQL kurun:

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb nown
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb nown
```

**Windows:**
[PostgreSQL installer](https://www.postgresql.org/download/windows/) ile kurun

### 4. `.env.local` oluşturun:
```bash
cp deployment/env.example .env.local
```

Düzenleyin:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nown"
DIRECT_URL="postgresql://postgres:password@localhost:5432/nown"
JWT_SECRET="your-random-secret-here"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV=development
```

### 5. Database migration:
```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Tarayıcıda açın: **http://localhost:3000** 🎉

## API Entegrasyonu

Projede aşağıdaki API rotaları bulunmaktadır:

### Kimlik Doğrulama

- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### Postlar

- `GET /api/posts` - Tüm postları listele
- `POST /api/posts` - Yeni post oluştur
- `GET /api/posts/[id]` - Belirli bir postu getir
- `PUT /api/posts/[id]` - Postu güncelle
- `DELETE /api/posts/[id]` - Postu sil
- `GET /api/posts/popular` - Popüler postları getir

### Beğeniler

- `POST /api/likes` - Post beğen
- `DELETE /api/likes?postId=123` - Post beğenisini kaldır

### Yorumlar

- `GET /api/posts/[id]/replies` - Post yorumlarını getir
- `POST /api/posts/[id]/replies` - Yorum ekle
- `DELETE /api/replies/[id]` - Yorumu sil

### Hashtagler

- `GET /api/hashtags/trending` - Trend olan hashtagleri getir

### Duyurular

- `GET /api/announcements` - Duyuruları getir

## Frontend API Entegrasyonu

Frontend bileşenlerinde API çağrıları şu şekilde yapılır:

```typescript
// Örnek: Post listesini getirme
const fetchPosts = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/posts", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.json();
    setPosts(data.posts || []);
  } catch (error) {
    console.error("Postlar yüklenirken hata oluştu:", error);
  }
};
```

## 🔐 Güvenlik

- **JWT Authentication** - Token-based auth (7 gün expiration)
- **Password Hashing** - bcryptjs ile güvenli şifre saklama
- **Role-based Access** - USER / MODERATOR / ADMIN
- **Firewall (UFW)** - Sadece 22, 80, 443 portları açık
- **SSL/TLS** - Let's Encrypt ile otomatik sertifika
- **Fail2ban** - Brute-force koruması
- **SQL Injection Safe** - Prisma ORM ile parameterized queries

## 📊 Özellikler

### Kullanıcı
- ✅ Kayıt olma / Giriş yapma
- ✅ Profil düzenleme (bio, fotoğraf)
- ✅ Kullanıcı profil sayfası
- ✅ Takip etme sistemi
- ✅ Doğrulama rozeti (mavi/turuncu)

### Post
- ✅ Post paylaşma (text + media)
- ✅ Anonim paylaşım
- ✅ Beğeni / Yorum / Alıntı
- ✅ Hashtag desteği
- ✅ Emoji & GIF picker
- ✅ Popüler postlar

### UI/UX
- ✅ Responsive tasarım
- ✅ Modern ve temiz arayüz
- ✅ Türkçe locale
- ✅ Loading states
- ✅ Error handling

## 🎯 Neden Self-Hosted PostgreSQL?

| Özellik | PostgreSQL | MySQL | SQLite | Supabase |
|---------|-----------|-------|--------|----------|
| **Performans** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Özellikler** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Güvenlik** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Maliyet** | 💰 Ücretsiz | 💰 Ücretsiz | 💰 Ücretsiz | 💰💰 Ücretli |
| **Kontrol** | ✅ Tam | ✅ Tam | ✅ Tam | ❌ Sınırlı |
| **Ölçeklenme** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

**Seçimimiz:** PostgreSQL - En güçlü, en güvenli, tamamen ücretsiz! 🏆
