# 🚀 Nown Projesi - DigitalOcean Deployment Rehberi

Bu rehber, Nown projesini DigitalOcean Ubuntu droplet'inde sıfırdan kurmanız için hazırlanmıştır.

## 📋 Ön Gereksinimler

- [ ] DigitalOcean hesabı
- [ ] Domain adı (opsiyonel ama önerilir)
- [ ] Supabase projesi oluşturulmuş
- [ ] Git repository'de proje (veya yerel dosyalar)

## 🎯 Kurulum Adımları

### 1️⃣ DigitalOcean Droplet Oluşturma

1. DigitalOcean'a giriş yapın
2. **Create > Droplets** tıklayın
3. Ayarlar:
   - **Region:** Frankfurt / Amsterdam
   - **Image:** Ubuntu 24.04 LTS x64
   - **Size:** Basic > Regular > **4GB RAM / 2 CPU** ($24/ay)
   - **Authentication:** SSH Key (önerilir) veya Password
   - **Hostname:** nown-prod
   - **Monitoring:** ✅ İşaretleyin
4. **Create Droplet** tıklayın
5. IP adresinizi not alın (örn: `123.45.67.89`)

### 2️⃣ Sunucuya Bağlanma

**SSH ile bağlanın:**
```bash
ssh root@123.45.67.89
```

İlk girişte şifre değiştirmeniz istenebilir.

### 3️⃣ Deployment Scriptlerini Yükleme

**Sunucuda şu komutları çalıştırın:**

```bash
# Deployment klasörü oluştur
mkdir -p /root/deployment
cd /root/deployment

# Scriptleri indir (GitHub'dan veya manuel yükle)
# Eğer GitHub'da yoksa, aşağıdaki adımları takip edin
```

**Scriptleri manuel yüklemek için:**

**Yerel bilgisayarınızda (PowerShell):**
```powershell
# Proje klasörüne gidin
cd E:\Nown\24nown

# Deployment scriptlerini sunucuya yükleyin
scp -r deployment root@123.45.67.89:/root/
```

### 4️⃣ Otomatik Kurulum

**Sunucuda (sırayla çalıştırın):**

#### Adım 1: Sunucu Kurulumu (10-15 dakika)
```bash
cd /root/deployment
chmod +x *.sh
bash setup-server.sh
```

Bu script şunları kurar:
- Node.js 20
- PostgreSQL 16
- Nginx
- PM2
- Firewall (UFW)
- Fail2ban

#### Adım 2: Database Yapılandırması (2 dakika)
```bash
bash setup-database.sh
```

⚠️ **ÖNEMLİ:** Bu komut çıktısında database şifresi gösterilecek. Kaydedin!

**Şifreyi görüntülemek için:**
```bash
cat /root/nown-db-credentials.txt
```

#### Adım 3: Proje Deployment (10-15 dakika)
```bash
bash deploy-project.sh
```

Bu script size soracaklar:
1. **Proje nasıl yüklenecek?**
   - Option 1: Git URL (eğer GitHub'da varsa)
   - Option 2: Manuel yükleme (SCP ile)

2. **Supabase bilgileri:**
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY

3. **Domain adı:**
   - Örn: nown.com veya api.nown.com

#### Adım 4: Nginx ve SSL (5 dakika)
```bash
bash setup-nginx.sh
```

⚠️ **Önce DNS ayarlarını yapın!**

**DNS Ayarları (Cloudflare / Domain sağlayıcı):**
```
Tip: A
Name: @ (veya subdomain)
Value: 123.45.67.89 (Droplet IP'niz)
TTL: Auto
```

## ✅ Kurulum Tamamlandı!

Artık siteniz çalışıyor! 🎉

**Erişim:**
- HTTPS: `https://yourdomain.com`
- HTTP: `http://123.45.67.89:3000` (geçici test için)

## 🛠️ Faydalı Komutlar

### PM2 (Uygulama Yönetimi)
```bash
pm2 status              # Durum kontrolü
pm2 logs nown           # Canlı logları görüntüle
pm2 logs nown --lines 100  # Son 100 log satırı
pm2 restart nown        # Uygulamayı yeniden başlat
pm2 stop nown           # Uygulamayı durdur
pm2 start nown          # Uygulamayı başlat
pm2 monit              # Gerçek zamanlı monitoring
```

### Nginx
```bash
systemctl status nginx  # Nginx durumu
systemctl restart nginx # Nginx'i yeniden başlat
nginx -t               # Config test
nano /etc/nginx/sites-available/nown  # Config düzenle
```

### PostgreSQL
```bash
sudo -u postgres psql  # PostgreSQL'e bağlan
\l                     # Database'leri listele
\c nown                # Nown database'ine bağlan
\dt                    # Tabloları listele
\q                     # Çık
```

### Sistem
```bash
htop                   # Sistem kaynaklarını izle
df -h                  # Disk kullanımı
free -h                # RAM kullanımı
ufw status             # Firewall durumu
journalctl -xe         # Sistem logları
```

## 🔄 Proje Güncelleme

Proje kodunda değişiklik yaptıktan sonra:

```bash
cd /var/www/nown/24nown

# Git'ten çek (eğer Git kullanıyorsanız)
git pull

# Bağımlılıkları güncelle (gerekirse)
npm install

# Prisma migration (gerekirse)
npx prisma migrate deploy
npx prisma generate

# Yeniden build et
npm run build

# Uygulamayı yeniden başlat
pm2 restart nown
```

## 🐛 Sorun Giderme

### Uygulama Çalışmıyor
```bash
# Logları kontrol et
pm2 logs nown --lines 50

# Port dinleniyor mu kontrol et
netstat -tulpn | grep 3000

# Uygulamayı manuel başlat (debug için)
cd /var/www/nown/24nown
npm run start
```

### Database Bağlantı Sorunu
```bash
# PostgreSQL çalışıyor mu?
systemctl status postgresql

# Database var mı?
sudo -u postgres psql -l

# .env dosyasını kontrol et
cat /var/www/nown/24nown/.env.local
```

### Nginx 502 Bad Gateway
```bash
# Uygulama çalışıyor mu?
pm2 status

# Nginx logları
tail -f /var/log/nginx/error.log
```

### SSL Sertifikası Yenilenmiyor
```bash
# Manuel yenileme
certbot renew

# Otomatik yenileme testi
certbot renew --dry-run
```

## 📊 Monitoring

### Gerçek Zamanlı İzleme
```bash
# PM2 monitoring
pm2 monit

# Sistem kaynakları
htop

# Network trafiği
iftop
```

### Log Dosyaları
```bash
# Uygulama logları
pm2 logs nown

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# Sistem logları
journalctl -f
```

## 🔒 Güvenlik

### Düzenli Güncelleme
```bash
apt update
apt upgrade -y
```

### Backup (Önemli!)
```bash
# Database backup
sudo -u postgres pg_dump nown > /root/backups/nown_$(date +%Y%m%d).sql

# Proje backup
tar -czf /root/backups/nown_project_$(date +%Y%m%d).tar.gz /var/www/nown
```

### Otomatik Backup (Crontab)
```bash
crontab -e

# Günlük backup (gece 2'de)
0 2 * * * sudo -u postgres pg_dump nown > /root/backups/nown_$(date +\%Y\%m\%d).sql
```

## 💡 İpuçları

1. **PM2 Save:** `pm2 save` komutu ile uygulamanızı kaydedin, sunucu yeniden başladığında otomatik çalışır
2. **Firewall:** Sadece gerekli portları açın (22, 80, 443)
3. **Monitoring:** DigitalOcean monitoring'i aktif edin
4. **Backup:** Düzenli backup alın!
5. **Logs:** Logları düzenli kontrol edin

## 📞 Destek

Sorun yaşarsanız:
1. Logları kontrol edin
2. Error mesajlarını okuyun
3. Google'da aratın
4. Stack Overflow'a sorun

## 🎉 Başarılar!

Artık production'da çalışan bir Next.js uygulamanız var!

---

**Son Güncelleme:** 2025-01-21

