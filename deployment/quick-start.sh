#!/bin/bash

###############################################################################
# HIZLI BAŞLANGIÇ - Tüm Kurulumu Tek Seferde Yapar
# Sadece ilk kurulum için kullanın!
###############################################################################

set -e

echo "=================================================="
echo "⚡ Nown Projesi - Hızlı Kurulum"
echo "=================================================="
echo ""
echo "Bu script SIFIRSIZ bir sunucuda çalışır ve"
echo "tüm kurulumu otomatik yapar."
echo ""
echo "⚠️  Bu işlem 20-30 dakika sürebilir."
echo ""
read -p "Devam etmek istiyor musunuz? (y/n): " CONTINUE

if [ "$CONTINUE" != "y" ]; then
    echo "Kurulum iptal edildi."
    exit 0
fi

# Script dizini
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
echo "1️⃣ Sunucu kurulumu başlıyor..."
bash "$SCRIPT_DIR/setup-server.sh"

echo ""
echo "2️⃣ Database yapılandırması başlıyor..."
bash "$SCRIPT_DIR/setup-database.sh"

echo ""
echo "3️⃣ Proje deployment başlıyor..."
bash "$SCRIPT_DIR/deploy-project.sh"

echo ""
echo "4️⃣ Nginx yapılandırması başlıyor..."
bash "$SCRIPT_DIR/setup-nginx.sh"

echo ""
echo "=================================================="
echo "🎉 TÜM KURULUM TAMAMLANDI!"
echo "=================================================="
echo ""
echo "Siteniz hazır!"
echo ""
echo "Faydalı komutlar:"
echo "- pm2 status          # Uygulama durumu"
echo "- pm2 logs nown       # Logları görüntüle"
echo "- pm2 restart nown    # Yeniden başlat"
echo ""

