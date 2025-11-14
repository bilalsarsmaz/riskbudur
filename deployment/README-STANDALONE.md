# 🚀 Nown - Standalone Deployment (TEK KOMUT!)

## ⚡ En Hızlı Yol - 15 Dakika

```bash
sudo bash deploy-standalone.sh
```

**Hepsi bu kadar!** 🎉

---

## 📋 Ön Hazırlık (5 dakika)

### 1. DigitalOcean Droplet Oluştur

- **Create → Droplets**
- **Region:** Frankfurt veya Amsterdam
- **Image:** Ubuntu 24.04 LTS
- **Size:** **4GB RAM / 2 CPU** ($24/ay)
- **Authentication:** Password (güçlü şifre)
- **Create Droplet** → IP'yi kopyala

### 2. DNS Ayarlarını Yap

Domain sağlayıcınızda (Cloudflare, Namecheap, vb.):

```
Type: A
Name: @ (veya subdomain adı)
Value: [DROPLET-IP-ADRESİ]
TTL: Auto
```

**⏱️ DNS yayılması 5-10 dakika sürebilir**

---

## 🎯 Kurulum Adımları

### 1️⃣ Sunucuya Bağlan

```bash
ssh root@[DROPLET-IP]
```

### 2️⃣ Deployment Scriptini Yükle

**Seçenek A: Git ile (Önerilen)**
```bash
git clone https://github.com/[sizin-repo]/nown.git
cd nown/deployment
chmod +x deploy-standalone.sh
```

**Seçenek B: SCP ile (Manuel)**
```bash
# Yerel bilgisayarınızdan:
scp deployment/deploy-standalone.sh root@[DROPLET-IP]:/root/
```

### 3️⃣ TEK KOMUTLA ÇALIŞTIR! 🚀

```bash
sudo bash deploy-standalone.sh
```

**Script şunları soracak:**
1. Proje yükleme yöntemi (Git URL veya manuel)
2. Domain adınız (örn: nown.com)

**Otomatik yapılanlar:**
- ✅ Node.js, PostgreSQL, Nginx kurulumu
- ✅ Database oluşturma ve şifre üretme
- ✅ Proje bağımlılıkları ve build
- ✅ PM2 ile production başlatma
- ✅ Nginx reverse proxy
- ✅ SSL sertifikası (Let's Encrypt)
- ✅ Firewall yapılandırma

---

## ✅ Kurulum Tamamlandı!

Siteniz hazır: **https://yourdomain.com** 🎉

### İlk Kullanıcıyı Oluştur

Tarayıcıda:
```
https://yourdomain.com
```

Kayıt ol → Test et! 🎊

---

## 🛠️ Yönetim Komutları

### Uygulama Durumu

```bash
pm2 status              # Çalışıyor mu?
pm2 logs nown           # Canlı loglar
pm2 restart nown        # Yeniden başlat
pm2 monit              # Gerçek zamanlı monitoring
```

### Database Yönetimi

```bash
# PostgreSQL'e bağlan
sudo -u postgres psql nown

# İçinde:
\dt                     # Tabloları listele
SELECT COUNT(*) FROM "User";   # Kullanıcı sayısı
\q                      # Çık

# Database şifresi
cat /root/nown-db-credentials.txt
```

### Sistem Durumu

```bash
systemctl status nginx          # Nginx durumu
systemctl status postgresql     # PostgreSQL durumu
htop                           # Sistem kaynakları
free -h                        # RAM kullanımı
df -h                          # Disk kullanımı
```

### Loglar

```bash
# Uygulama logları
pm2 logs nown --lines 100

# Nginx logları
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Sistem logları
journalctl -xe
```

---

## 🔄 Kod Güncelleme

Kod değişikliği yaptınız mı?

```bash
cd /var/www/nown

# Git'ten çek
git pull

# Bağımlılıkları güncelle (gerekirse)
npm install

# Database migration (gerekirse)
npx prisma migrate deploy
npx prisma generate

# Yeniden build
npm run build

# Uygulamayı yeniden başlat
pm2 restart nown
```

---

## 💾 Yedekleme

### Manuel Yedek

```bash
# Database backup
sudo -u postgres pg_dump nown > /root/backup_$(date +%Y%m%d).sql

# Proje backup
tar -czf /root/nown_backup_$(date +%Y%m%d).tar.gz /var/www/nown
```

### Otomatik Günlük Yedek

```bash
crontab -e
```

Ekleyin:
```bash
# Her gece saat 2'de database yedekle
0 2 * * * sudo -u postgres pg_dump nown > /root/backups/nown_$(date +\%Y\%m\%d).sql

# Eski yedekleri temizle (30+ gün)
0 3 * * * find /root/backups -name "nown_*.sql" -mtime +30 -delete
```

---

## 🐛 Sorun Giderme

### Uygulama Çalışmıyor

```bash
# Logları kontrol et
pm2 logs nown --lines 50

# Manuel başlat (debug için)
cd /var/www/nown
npm run start

# Port dinleniyor mu?
netstat -tulpn | grep 3000
```

### 502 Bad Gateway

```bash
# Uygulama çalışıyor mu?
pm2 status

# Nginx'i yeniden başlat
systemctl restart nginx

# Uygulamayı yeniden başlat
pm2 restart nown
```

### Database Bağlantı Hatası

```bash
# PostgreSQL çalışıyor mu?
systemctl status postgresql

# Database var mı?
sudo -u postgres psql -l | grep nown

# .env dosyasını kontrol et
cat /var/www/nown/.env.local
```

### SSL Sertifikası Yenilenmiyor

```bash
# Manuel yenileme
certbot renew

# Test (gerçek yenilemez)
certbot renew --dry-run

# Otomatik yenileme log
cat /var/log/letsencrypt/letsencrypt.log
```

---

## 🔒 Güvenlik

### Düzenli Güncelleme

```bash
apt update && apt upgrade -y
```

### SSH Güvenliği

```bash
# Şifresiz SSH (önerilen)
ssh-keygen -t rsa -b 4096
ssh-copy-id root@[DROPLET-IP]

# /etc/ssh/sshd_config düzenle:
# PasswordAuthentication no
```

### Database Şifresi Değiştir

```bash
sudo -u postgres psql
ALTER USER nownuser WITH PASSWORD 'yeni_güçlü_şifre';
\q

# .env.local'i güncelle
nano /var/www/nown/.env.local
# DATABASE_URL'deki şifreyi değiştir

# Uygulamayı yeniden başlat
pm2 restart nown
```

---

## 📊 Özellikler

### Kurulu Sistemler

- ✅ **Node.js 20** - En son LTS sürümü
- ✅ **PostgreSQL 16** - En güçlü open-source database
- ✅ **Nginx** - Yüksek performanslı web server
- ✅ **PM2** - Production process manager
- ✅ **Let's Encrypt SSL** - Ücretsiz HTTPS
- ✅ **UFW Firewall** - Güvenlik duvarı
- ✅ **Fail2ban** - Brute-force koruması

### Database Özellikleri

- ✅ Full-text search
- ✅ JSON support
- ✅ Array operations
- ✅ Transactions
- ✅ Foreign keys & constraints
- ✅ Automatic backups

### Neden PostgreSQL?

- 🚀 **Hızlı:** MySQL'den daha performanslı
- 🔒 **Güvenli:** ACID compliance
- 📊 **Zengin:** JSON, arrays, full-text search
- 🌍 **Standart:** Fortune 500'ların tercihi
- 💰 **Ücretsiz:** Tamamen açık kaynak

---

## 💡 İpuçları

1. **PM2 Save:** `pm2 save` ile mevcut durumu kaydet
2. **Monitoring:** `pm2 monit` ile gerçek zamanlı izle
3. **Logs:** `pm2 logs nown --lines 1000` ile son 1000 satır
4. **Restart:** Her kod değişikliğinden sonra `pm2 restart nown`
5. **Backup:** Günlük otomatik yedek mutlaka kurun

---

## 🎯 Performans Optimizasyonu

### PM2 Cluster Mode (Çok Çekirdekli)

```bash
pm2 delete nown
pm2 start npm --name "nown" -i max -- start
pm2 save
```

### Nginx Caching

Zaten yapılandırılmış! Static dosyalar 1 saat cache'leniyor.

### Database Indexing

```sql
-- PostgreSQL'e bağlan
sudo -u postgres psql nown

-- Örnek index'ler
CREATE INDEX idx_post_created ON "Post"(createdAt DESC);
CREATE INDEX idx_user_nickname ON "User"(nickname);
```

---

## 📞 Destek

### Loglar Hata Veriyor?

1. **Hatayı kopyala:** `pm2 logs nown --err --lines 50`
2. **Google'da ara:** Genelde çözümü bulunur
3. **GitHub Issues:** Repo'da issue aç

### Sunucu Yavaş?

```bash
# Kaynak kullanımı
htop
free -h
df -h

# En çok kaynak tüketen procesler
ps aux --sort=-%mem | head
ps aux --sort=-%cpu | head
```

---

## 🎉 Tebrikler!

Artık production'da çalışan, tamamen self-hosted bir sosyal medya platformunuz var! 🚀

**Maliyet:**
- Droplet: $24/ay (4GB RAM)
- Domain: ~$10/yıl
- SSL: Ücretsiz (Let's Encrypt)
- **Toplam: ~$25/ay** 💰

**Karşılaştırma:**
- Heroku: ~$50/ay (Hobby dyno + DB)
- AWS/Azure: ~$100+/ay
- **Tasarruf: %50-75** 📉

---

**Başarılar Dilerim! 🎊**

---

## 📚 Ek Okuma

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)

