#!/bin/bash

###############################################################################
# Yedekleme Scripti
# Database ve proje dosyalarını yedekler
###############################################################################

set -e

echo "=================================================="
echo "💾 Yedekleme Başlıyor"
echo "=================================================="
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Yedek dizini
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Dizini oluştur
mkdir -p "$BACKUP_DIR"

echo "📁 Yedek dizini: $BACKUP_DIR"
echo ""

# Database backup
echo "1️⃣ Database yedekleniyor..."
sudo -u postgres pg_dump nown > "$BACKUP_DIR/nown_db_$DATE.sql"
echo -e "${GREEN}✓ Database yedeklendi: nown_db_$DATE.sql${NC}"
echo ""

# Proje dosyaları backup
echo "2️⃣ Proje dosyaları yedekleniyor..."
tar -czf "$BACKUP_DIR/nown_project_$DATE.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    /var/www/nown
echo -e "${GREEN}✓ Proje yedeklendi: nown_project_$DATE.tar.gz${NC}"
echo ""

# .env dosyası backup
echo "3️⃣ Konfigürasyon dosyaları yedekleniyor..."
cp /var/www/nown/24nown/.env.local "$BACKUP_DIR/env_$DATE.backup"
cp /root/nown-db-credentials.txt "$BACKUP_DIR/db_credentials_$DATE.backup" 2>/dev/null || true
echo -e "${GREEN}✓ Konfigürasyon yedeklendi${NC}"
echo ""

# Eski yedekleri temizle (30 günden eski)
echo "4️⃣ Eski yedekler temizleniyor (30+ gün öncesi)..."
find "$BACKUP_DIR" -name "nown_*" -type f -mtime +30 -delete
echo -e "${GREEN}✓ Eski yedekler temizlendi${NC}"
echo ""

# Yedek boyutları
echo "=================================================="
echo "📊 Yedek Bilgileri"
echo "=================================================="
ls -lh "$BACKUP_DIR" | grep "$DATE"
echo ""

# Toplam boyut
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "Toplam yedek boyutu: $TOTAL_SIZE"
echo ""

echo -e "${GREEN}✅ Yedekleme tamamlandı!${NC}"
echo ""
echo "Yedekleri görüntülemek için:"
echo "ls -lh $BACKUP_DIR"
echo ""
echo "Yedeği geri yüklemek için:"
echo "Database: sudo -u postgres psql nown < $BACKUP_DIR/nown_db_$DATE.sql"
echo "Proje: tar -xzf $BACKUP_DIR/nown_project_$DATE.tar.gz -C /"
echo ""

