#!/bin/bash

###############################################################################
# Proje Güncelleme Scripti
# Kod değişikliklerinden sonra kullanın
###############################################################################

set -e

echo "=================================================="
echo "🔄 Nown Projesi Güncelleniyor"
echo "=================================================="
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/var/www/nown/24nown"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}✗ Proje bulunamadı: $PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

echo "📥 Güncelleme yöntemi seçin:"
echo "1. Git pull (repository'den çek)"
echo "2. Manuel dosya değişikliği yaptım (sadece rebuild)"
echo ""
read -p "Seçiminiz (1 veya 2): " UPDATE_METHOD

if [ "$UPDATE_METHOD" == "1" ]; then
    echo ""
    echo -e "${BLUE}ℹ Git'ten güncellemeler çekiliyor...${NC}"
    git pull
    echo -e "${GREEN}✓ Güncellemeler çekildi${NC}"
    
    echo ""
    read -p "Bağımlılıklar güncellendi mi? (y/n): " UPDATE_DEPS
    if [ "$UPDATE_DEPS" == "y" ]; then
        echo "📦 Bağımlılıklar güncelleniyor..."
        npm install
        echo -e "${GREEN}✓ Bağımlılıklar güncellendi${NC}"
    fi
    
    echo ""
    read -p "Prisma schema değişti mi? (y/n): " UPDATE_PRISMA
    if [ "$UPDATE_PRISMA" == "y" ]; then
        echo "🗄️ Prisma migration çalıştırılıyor..."
        npx prisma migrate deploy
        npx prisma generate
        echo -e "${GREEN}✓ Prisma migration tamamlandı${NC}"
    fi
fi

echo ""
echo "=================================================="
echo "🔨 Proje Build Ediliyor"
echo "=================================================="
npm run build
echo -e "${GREEN}✓ Build tamamlandı${NC}"

echo ""
echo "=================================================="
echo "⚙️ Uygulama Yeniden Başlatılıyor"
echo "=================================================="
pm2 restart nown
echo -e "${GREEN}✓ Uygulama yeniden başlatıldı${NC}"

echo ""
echo "=================================================="
echo "✅ Güncelleme Tamamlandı!"
echo "=================================================="
echo ""
echo "Durumu kontrol edin:"
echo "pm2 logs nown --lines 50"
echo ""

