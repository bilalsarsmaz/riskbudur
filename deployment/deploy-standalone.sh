#!/bin/bash

###############################################################################
# 🚀 NOWN - TEK KOMUTLA STANDALONE DEPLOYMENT
# PostgreSQL + Next.js - Supabase YOK, Tamamen Self-Hosted
###############################################################################

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        🚀 NOWN - Standalone Deployment Başlıyor              ║"
echo "║        PostgreSQL + Next.js (Self-Hosted)                     ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Root kontrolü
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}✗ Bu scripti root olarak çalıştırmalısınız:${NC}"
    echo "  sudo bash deploy-standalone.sh"
    exit 1
fi

# Droplet IP'sini otomatik al
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}                    📋 Kurulum Bilgileri${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Bu script şunları yapacak:"
echo "  ✓ Node.js 20, PostgreSQL 16, Nginx kurulumu"
echo "  ✓ Database oluşturma ve yapılandırma"
echo "  ✓ Proje deployment (Git veya manuel)"
echo "  ✓ SSL sertifikası kurulumu (Let's Encrypt)"
echo "  ✓ PM2 ile production başlatma"
echo ""
echo "Tahmini süre: 15-20 dakika ⏱️"
echo "Sunucu IP: $SERVER_IP"
echo ""
echo -e "${YELLOW}⚠️  Kuruluma başlamadan önce hazır olması gerekenler:${NC}"
echo "  □ Domain adı DNS'e eklenmiş (A kaydı: @ → $SERVER_IP)"
echo "  □ Proje dosyaları Git'te VEYA yerel bilgisayarda"
echo ""
read -p "Hazır mısınız? Devam etmek için ENTER'a basın (Ctrl+C ile iptal)..."

###############################################################################
# 1️⃣ SİSTEM GÜNCELLEMESİ VE GEREKLI PAKETLER
###############################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}1️⃣  Sistem Güncelleniyor ve Gerekli Paketler Kuruluyor${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

apt update && apt upgrade -y
apt install -y curl wget git build-essential ufw fail2ban

echo -e "${GREEN}✓ Sistem güncellendi${NC}"

###############################################################################
# 2️⃣ NODE.JS KURULUMU
###############################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}2️⃣  Node.js 20 Kuruluyor${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✓ Node.js kuruldu: $(node -v)${NC}"
else
    echo -e "${GREEN}✓ Node.js zaten kurulu: $(node -v)${NC}"
fi

###############################################################################
# 3️⃣ POSTGRESQL KURULUMU
###############################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}3️⃣  PostgreSQL 16 Kuruluyor${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    echo -e "${GREEN}✓ PostgreSQL kuruldu${NC}"
else
    echo -e "${GREEN}✓ PostgreSQL zaten kurulu${NC}"
fi

# Database oluştur
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

echo ""
echo -e "${BLUE}ℹ  Database oluşturuluyor...${NC}"

sudo -u postgres psql <<EOF
-- Eğer database varsa düşür ve yeniden oluştur
DROP DATABASE IF EXISTS nown;
DROP USER IF EXISTS nownuser;

-- Database oluştur
CREATE DATABASE nown;

-- Kullanıcı oluştur
CREATE USER nownuser WITH PASSWORD '$DB_PASSWORD';

-- Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE nown TO nownuser;

-- PostgreSQL 15+ için gerekli
\c nown
GRANT ALL ON SCHEMA public TO nownuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nownuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nownuser;
\q
EOF

# Connection string
CONNECTION_STRING="postgresql://nownuser:$DB_PASSWORD@localhost:5432/nown"

# Credentials'ı kaydet
cat > /root/nown-db-credentials.txt <<EOF
# Nown Database Credentials
# ⚠️  Bu bilgileri GÜVENLİ BİR YERE KAYDET!

DATABASE_URL="$CONNECTION_STRING"
DIRECT_URL="$CONNECTION_STRING"

# PostgreSQL Connection Details
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nown
DB_USER=nownuser
DB_PASSWORD=$DB_PASSWORD
EOF

chmod 600 /root/nown-db-credentials.txt

echo -e "${GREEN}✓ Database oluşturuldu: nown${NC}"
echo -e "${YELLOW}  Credentials kaydedildi: /root/nown-db-credentials.txt${NC}"

###############################################################################
# 4️⃣ NGINX KURULUMU
###############################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}4️⃣  Nginx Kuruluyor${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo -e "${GREEN}✓ Nginx kuruldu${NC}"
else
    echo -e "${GREEN}✓ Nginx zaten kurulu${NC}"
fi

###############################################################################
# 5️⃣ PM2 KURULUMU
###############################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}5️⃣  PM2 Kuruluyor${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup
    echo -e "${GREEN}✓ PM2 kuruldu${NC}"
else
    echo -e "${GREEN}✓ PM2 zaten kurulu${NC}"
fi

###############################################################################
# 6️⃣ FIREWALL YAPILANDIRMASI
###############################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}6️⃣  Firewall (UFW) Yapılandırılıyor${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ufw --force enable
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

echo -e "${GREEN}✓ Firewall yapılandırıldı (22, 80, 443 portları açık)${NC}"

###############################################################################
# 7️⃣ PROJE DEPLOYMENT
###############################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}7️⃣  Proje Deployment${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PROJECT_DIR="/var/www/nown"
PROJECT_APP_DIR="/var/www/nown"

echo "Proje nasıl yüklenecek?"
echo "  1. Git repository'den çek (önerilen)"
echo "  2. Yerel dosyalar (SCP ile manuel yükleme)"
echo ""
read -p "Seçiminiz (1 veya 2): " UPLOAD_METHOD

if [ "$UPLOAD_METHOD" == "1" ]; then
    echo ""
    read -p "Git repository URL: " GIT_URL
    
    if [ -d "$PROJECT_DIR" ]; then
        echo -e "${YELLOW}⚠  Proje dizini mevcut, siliniyor...${NC}"
        rm -rf "$PROJECT_DIR"
    fi
    
    echo -e "${BLUE}ℹ  Git'ten çekiliyor...${NC}"
    mkdir -p /var/www
    cd /var/www
    git clone "$GIT_URL" nown
    
elif [ "$UPLOAD_METHOD" == "2" ]; then
    echo ""
    echo -e "${YELLOW}Manuel Yükleme Modu${NC}"
    echo ""
    echo "Başka bir terminal açın ve şu komutu çalıştırın:"
    echo -e "${CYAN}scp -r /yerel/proje/yolu root@$SERVER_IP:/var/www/nown${NC}"
    echo ""
    read -p "Proje yüklendi mi? (y/n): " UPLOADED
    
    if [ "$UPLOADED" != "y" ]; then
        echo -e "${RED}✗ Önce projeyi yükleyin, sonra tekrar çalıştırın${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Geçersiz seçim${NC}"
    exit 1
fi

# Proje kontrolü
if [ ! -d "$PROJECT_APP_DIR" ]; then
    echo -e "${RED}✗ Proje bulunamadı: $PROJECT_APP_DIR${NC}"
    exit 1
fi

cd "$PROJECT_APP_DIR"

# Bağımlılıkları kur
echo ""
echo -e "${BLUE}ℹ  NPM bağımlılıkları kuruluyor...${NC}"
npm install
echo -e "${GREEN}✓ Bağımlılıklar kuruldu${NC}"

# .env.local oluştur
echo ""
echo -e "${BLUE}ℹ  .env.local oluşturuluyor...${NC}"

# JWT Secret oluştur
JWT_SECRET=$(openssl rand -base64 64 | tr -d "\n")

# Domain sor
echo ""
read -p "Domain adınız (örn: nown.com veya api.nown.com): " DOMAIN

# .env.local oluştur
cat > .env.local <<EOF
# Database (Self-Hosted PostgreSQL)
DATABASE_URL="$CONNECTION_STRING"
DIRECT_URL="$CONNECTION_STRING"

# JWT Authentication
JWT_SECRET="$JWT_SECRET"

# Next.js Configuration
NEXT_PUBLIC_API_URL="https://$DOMAIN/api"
NODE_ENV=production

# Server
PORT=3000
EOF

chmod 600 .env.local

echo -e "${GREEN}✓ .env.local oluşturuldu${NC}"

# Prisma Migration
echo ""
echo -e "${BLUE}ℹ  Database migration çalıştırılıyor...${NC}"
npx prisma generate
npx prisma migrate deploy
echo -e "${GREEN}✓ Database migration tamamlandı${NC}"

# Build
echo ""
echo -e "${BLUE}ℹ  Proje build ediliyor... (Bu 2-3 dakika sürebilir)${NC}"
npm run build
echo -e "${GREEN}✓ Build tamamlandı${NC}"

# PM2 ile başlat
echo ""
echo -e "${BLUE}ℹ  PM2 ile uygulama başlatılıyor...${NC}"
pm2 delete nown 2>/dev/null || true
pm2 start npm --name "nown" -- start
pm2 save
echo -e "${GREEN}✓ Uygulama PM2 ile başlatıldı${NC}"

###############################################################################
# 8️⃣ NGINX YAPILANDIRMASI
###############################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}8️⃣  Nginx Yapılandırılıyor${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cat > /etc/nginx/sites-available/nown <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Güvenlik headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Next.js'e proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout ayarları
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static dosyalar için cache
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Client max body size
    client_max_body_size 10M;
}
EOF

ln -sf /etc/nginx/sites-available/nown /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx test
nginx -t
systemctl reload nginx

echo -e "${GREEN}✓ Nginx yapılandırıldı${NC}"

###############################################################################
# 9️⃣ SSL SERTİFİKASI
###############################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}9️⃣  SSL Sertifikası (Let's Encrypt)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}DNS kontrol ediliyor...${NC}"
echo "Domain: $DOMAIN → $SERVER_IP"
echo ""

DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
if [ "$DOMAIN_IP" == "$SERVER_IP" ]; then
    echo -e "${GREEN}✓ DNS doğru yapılandırılmış${NC}"
    
    # Certbot kurulumu
    apt install -y certbot python3-certbot-nginx
    
    # SSL sertifikası al
    echo ""
    echo -e "${BLUE}ℹ  SSL sertifikası alınıyor...${NC}"
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email --redirect
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ SSL sertifikası başarıyla kuruldu!${NC}"
    else
        echo -e "${YELLOW}⚠  SSL sertifikası kurulamadı (Şimdilik HTTP kullanabilirsiniz)${NC}"
    fi
else
    echo -e "${YELLOW}⚠  DNS henüz yayılmamış${NC}"
    echo "  Beklenen IP: $SERVER_IP"
    echo "  Mevcut IP:   $DOMAIN_IP"
    echo ""
    echo "SSL'i daha sonra kurmak için:"
    echo "  sudo certbot --nginx -d $DOMAIN"
fi

###############################################################################
# 🎉 TAMAMLANDI!
###############################################################################

echo ""
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║              ✅  DEPLOYMENT BAŞARIYLA TAMAMLANDI!             ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}📊  Kurulum Özeti${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  🌐 ${BOLD}Website:${NC}        https://$DOMAIN"
echo -e "  📁 ${BOLD}Proje Dizini:${NC}   $PROJECT_APP_DIR"
echo -e "  🗄️  ${BOLD}Database:${NC}       PostgreSQL (nown)"
echo -e "  🔑 ${BOLD}DB Credentials:${NC} /root/nown-db-credentials.txt"
echo -e "  🚀 ${BOLD}Process Manager:${NC} PM2"
echo -e "  🌍 ${BOLD}Web Server:${NC}     Nginx"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🛠️  Faydalı Komutlar${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  PM2 Komutları:"
echo "    pm2 status              # Uygulama durumu"
echo "    pm2 logs nown           # Canlı loglar"
echo "    pm2 restart nown        # Yeniden başlat"
echo "    pm2 monit              # Monitoring"
echo ""
echo "  Database:"
echo "    sudo -u postgres psql nown  # PostgreSQL'e bağlan"
echo "    cat /root/nown-db-credentials.txt  # DB şifresi"
echo ""
echo "  Sistem:"
echo "    systemctl status nginx      # Nginx durumu"
echo "    systemctl status postgresql # PostgreSQL durumu"
echo "    htop                       # Sistem kaynakları"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}💾  Yedekleme${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Manuel yedek:"
echo "    sudo -u postgres pg_dump nown > backup.sql"
echo ""
echo "  Otomatik günlük yedek için:"
echo "    crontab -e"
echo "    # Ekleyin: 0 2 * * * sudo -u postgres pg_dump nown > /root/backups/nown_\$(date +\\%Y\\%m\\%d).sql"
echo ""
echo -e "${GREEN}🎉  Nown başarıyla kuruldu ve çalışıyor!${NC}"
echo ""
echo -e "${YELLOW}⚠️  ÖNEMLİ: Database şifresini güvenli bir yere kaydedin!${NC}"
echo "    cat /root/nown-db-credentials.txt"
echo ""

