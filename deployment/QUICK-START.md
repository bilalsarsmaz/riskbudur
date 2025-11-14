# ⚡ Hızlı Başlangıç Rehberi - 15 Dakika

Bu rehber, Nown projesini DigitalOcean'da 15 dakikada canlıya almanız için hazırlanmıştır.

## 🎯 Hızlı Özet

```
1. Droplet Oluştur → 2. Bağlan → 3. Scriptleri Yükle → 4. Çalıştır → ✅ Bitti!
```

---

## 1️⃣ DigitalOcean Droplet Oluştur (3 dakika)

### Web Arayüzünden:
- **Create → Droplets**
- **Region:** Frankfurt
- **Image:** Ubuntu 24.04 LTS
- **Size:** 4GB RAM ($24/ay)
- **Password:** Güçlü bir şifre seçin
- **Create Droplet**

✅ **IP adresini not alın:** `123.45.67.89`

---

## 2️⃣ Sunucuya Bağlan (1 dakika)

### Windows PowerShell'den:
```powershell
ssh root@123.45.67.89
```

Şifre girin ve bağlanın.

---

## 3️⃣ Scriptleri Yükle (2 dakika)

### Yerel Bilgisayarınızdan (Yeni PowerShell penceresi):
```powershell
# Proje dizinine gidin
cd E:\Nown\24nown

# Scriptleri sunucuya yükleyin
scp -r deployment root@123.45.67.89:/root/
```

### Sunucuda:
```bash
cd /root/deployment
chmod +x *.sh
```

---

## 4️⃣ Otomatik Kurulum (10-15 dakika)

### ⚡ TEK KOMUTLA TÜM KURULUM:

```bash
bash quick-start.sh
```

Bu komut şunları otomatik yapar:
- ✅ Node.js, PostgreSQL, Nginx kurulumu
- ✅ Database oluşturma
- ✅ Proje deployment
- ✅ SSL sertifikası

### Sorulacaklar:

1. **Proje yükleme yöntemi:**
   ```
   1. Git URL (varsa)
   2. Manuel (SCP ile yüklediyseniz)
   ```

2. **Supabase bilgileri:**
   - URL: `https://xxx.supabase.co`
   - Key: `eyJh...`

3. **Domain adı:**
   - Örnek: `nown.com`

4. **DNS hazır mı?**
   - DNS A kaydı ekleyin: `@ → 123.45.67.89`

---

## ✅ Tamamlandı!

Artık siteniz çalışıyor: **https://yourdomain.com** 🎉

---

## 🚀 Alternatif: Adım Adım Kurulum

Manuel kontrol isterseniz:

```bash
# 1. Sunucu kurulumu
bash setup-server.sh

# 2. Database
bash setup-database.sh

# 3. Proje deployment
bash deploy-project.sh

# 4. Nginx ve SSL
bash setup-nginx.sh
```

---

## 📋 Ön Hazırlık Listesi

Kuruluma başlamadan önce bunları hazırlayın:

- [ ] DigitalOcean hesabı (kredi kartı gerekli)
- [ ] Domain adı (Cloudflare, Namecheap, vs.)
- [ ] Supabase hesabı ve proje
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Proje dosyaları hazır (Git veya local)

---

## 🎬 Adım Adım Video İzler Gibi

### 1. Droplet Oluşturma
```
DigitalOcean.com → Login
→ Create → Droplets
→ Frankfurt, Ubuntu 24.04, 4GB
→ Create
→ IP'yi kopyala
```

### 2. SSH Bağlantısı
```
PowerShell Aç
→ ssh root@IP-ADRESİ
→ Şifre Gir
→ Bağlandı ✓
```

### 3. Scriptleri Yükleme
```
Yeni PowerShell Aç (yerel PC'de)
→ cd E:\Nown\24nown
→ scp -r deployment root@IP:/root/
→ Yüklendi ✓
```

### 4. Kurulum
```
SSH penceresine dön
→ cd /root/deployment
→ chmod +x *.sh
→ bash quick-start.sh
→ Soruları cevapla
→ 15 dakika bekle ☕
→ Bitti! 🎉
```

---

## 🛠️ Önemli Komutlar

### Durum Kontrolü
```bash
pm2 status              # Uygulama çalışıyor mu?
systemctl status nginx  # Nginx çalışıyor mu?
systemctl status postgresql  # DB çalışıyor mu?
```

### Logları İzle
```bash
pm2 logs nown          # Uygulama logları
tail -f /var/log/nginx/error.log  # Nginx hataları
```

### Yeniden Başlatma
```bash
pm2 restart nown       # Uygulamayı yeniden başlat
systemctl restart nginx  # Nginx'i yeniden başlat
```

---

## 🐛 Sorun mu Var?

### Uygulama çalışmıyor
```bash
pm2 logs nown --lines 100
```

### 502 Bad Gateway
```bash
pm2 restart nown
systemctl restart nginx
```

### SSL sorunu
```bash
certbot renew
```

---

## 🎯 Sonraki Adımlar

✅ Kurulum tamamlandı, şimdi ne yapacaksınız?

1. **Test Edin:** Siteyi açın ve test edin
2. **İlk Kullanıcı:** Kayıt olun ve test edin
3. **Geliştirme:** Kod değişiklikleri yapın
4. **Güncelleme:** `bash update-project.sh` çalıştırın

---

## 💾 Yedekleme

Günlük otomatik yedekleme için:

```bash
# Tek seferlik yedek
bash backup.sh

# Otomatik günlük yedek (crontab)
crontab -e

# Ekleyin:
0 2 * * * /root/deployment/backup.sh
```

---

## 🎉 Tebrikler!

Artık production'da çalışan bir Next.js uygulamanız var!

**İletişim:** Her türlü soru için logları kontrol edin veya belgelerden yardım alın.

---

**Kurulum Süresi:** ~15 dakika  
**Maliyet:** $24/ay (Droplet) + Domain  
**Zorluk:** ⭐⭐⚪⚪⚪ Kolay

