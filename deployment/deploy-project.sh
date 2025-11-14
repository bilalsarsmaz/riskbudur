#!/bin/bash

###############################################################################
# Nown Projesi Deployment Scripti
###############################################################################

set -e

echo "=================================================="
echo "🚀 Nown Projesi Deploy Ediliyor"
echo "=================================================="
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Root kontrolü
if [ "$EUID" -ne 0 ]; then 
    echo "Bu scripti root olarak çalıştırmalısınız: sudo bash deploy-project.sh"
    exit 1
fi

# Proje dizini
PROJECT_DIR="/var/www/nown"
PROJECT_APP_DIR="/var/www/nown/24nown"

echo "📥 Proje nasıl yüklenecek?"
echo "1. Git repository'den çek"
echo "2. Yerel dosyalardan yükle (manuel upload)"
echo ""
read -p "Seçiminiz (1 veya 2): " UPLOAD_METHOD

if [ "$UPLOAD_METHOD" == "1" ]; then
    echo ""
    read -p "Git repository URL'sini girin: " GIT_URL
    
    if [ -d "$PROJECT_DIR" ]; then
        echo -e "${YELLOW}⚠ Proje dizini mevcut, siliniyor...${NC}"
        rm -rf "$PROJECT_DIR"
    fi
    
    echo -e "${BLUE}ℹ Git'ten proje çekiliyor...${NC}"
    cd /var/www
    git clone "$GIT_URL" nown
    
elif [ "$UPLOAD_METHOD" == "2" ]; then
    echo ""
    echo -e "${YELLOW}⚠ Manuel yükleme modu seçildi${NC}"
    echo ""
    echo "Projenizi şu dizine yükleyin:"
    echo "$PROJECT_DIR"
    echo ""
    echo "SCP ile yükleme örneği:"
    echo "scp -r /yerel/proje/yolu root@sunucu-ip:/var/www/nown"
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

echo ""
echo "=================================================="
echo "📦 Bağımlılıklar Kuruluyor"
echo "=================================================="
npm install
echo -e "${GREEN}✓ Bağımlılıklar kuruldu${NC}"
echo ""

echo "=================================================="
echo "⚙️ .env Dosyası Oluşturuluyor"
echo "=================================================="

# Database bilgilerini oku
if [ -f "/root/nown-db-credentials.txt" ]; then
    DB_URL=$(grep "DATABASE_URL=" /root/nown-db-credentials.txt | cut -d '"' -f 2)
else
    echo -e "${YELLOW}⚠ Database bilgileri bulunamadı${NC}"
    read -p "DATABASE_URL girin: " DB_URL
fi

echo ""
echo "Supabase bilgileri:"
read -p "NEXT_PUBLIC_SUPABASE_URL: " SUPABASE_URL
read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_KEY

# JWT Secret oluştur
JWT_SECRET=$(openssl rand -base64 64 | tr -d "\n")

# Domain
read -p "Domain adınız (örn: nown.com): " DOMAIN

# .env.local oluştur
cat > .env.local <<EOF
# Database
DATABASE_URL="$DB_URL"
DIRECT_URL="$DB_URL"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_KEY"

# JWT
JWT_SECRET="$JWT_SECRET"

# Next.js
NEXT_PUBLIC_API_URL="https://$DOMAIN/api"
NODE_ENV=production
EOF

echo -e "${GREEN}✓ .env.local oluşturuldu${NC}"
echo ""

echo "=================================================="
echo "🗄️ Prisma Migration Çalıştırılıyor"
echo "=================================================="
npx prisma generate
npx prisma migrate deploy
echo -e "${GREEN}✓ Database migration tamamlandı${NC}"
echo ""

echo "=================================================="
echo "🔨 Proje Build Ediliyor"
echo "=================================================="
npm run build
echo -e "${GREEN}✓ Build tamamlandı${NC}"
echo ""

echo "=================================================="
echo "⚙️ PM2 ile Uygulama Başlatılıyor"
echo "=================================================="

# Eğer çalışıyorsa durdur
pm2 delete nown 2>/dev/null || true

# Başlat
pm2 start npm --name "nown" -- start
pm2 save
pm2 startup

echo -e "${GREEN}✓ Uygulama PM2 ile başlatıldı${NC}"
echo ""

echo "=================================================="
echo "✅ Deployment Tamamlandı!"
echo "=================================================="
echo ""
echo "Uygulama şu anda çalışıyor!"
echo ""
echo "Faydalı komutlar:"
echo "- PM2 durumu: pm2 status"
echo "- Logları görüntüle: pm2 logs nown"
echo "- Uygulamayı yeniden başlat: pm2 restart nown"
echo "- Uygulamayı durdur: pm2 stop nown"
echo ""
echo -e "${BLUE}ℹ Şimdi Nginx yapılandırmasını tamamlayın:${NC}"
echo "sudo bash setup-nginx.sh"
echo ""

