#!/bin/bash

###############################################################################
# PostgreSQL Database Kurulum Scripti
###############################################################################

set -e

echo "=================================================="
echo "🐘 PostgreSQL Database Yapılandırması"
echo "=================================================="
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Root kontrolü
if [ "$EUID" -ne 0 ]; then 
    echo "Bu scripti root olarak çalıştırmalısınız: sudo bash setup-database.sh"
    exit 1
fi

# Random güçlü şifre oluştur
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

echo "Database bilgileri:"
echo "==================="
echo "Database: nown"
echo "Kullanıcı: nownuser"
echo "Şifre: $DB_PASSWORD"
echo ""
echo -e "${YELLOW}⚠️  Bu şifreyi kaydedin! .env dosyasında kullanacaksınız.${NC}"
echo ""

# PostgreSQL komutlarını çalıştır
sudo -u postgres psql <<EOF
-- Database oluştur
CREATE DATABASE nown;

-- Kullanıcı oluştur
CREATE USER nownuser WITH PASSWORD '$DB_PASSWORD';

-- Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE nown TO nownuser;

-- PostgreSQL 15+ için gerekli
\c nown
GRANT ALL ON SCHEMA public TO nownuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nownuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nownuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nownuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nownuser;

\q
EOF

echo ""
echo -e "${GREEN}✓ Database başarıyla oluşturuldu!${NC}"
echo ""

# Connection string oluştur
CONNECTION_STRING="postgresql://nownuser:$DB_PASSWORD@localhost:5432/nown"

# .env bilgilerini dosyaya kaydet
cat > /root/nown-db-credentials.txt <<EOF
# Nown Database Credentials
# Bu bilgileri .env.local dosyasına ekleyin

DATABASE_URL="$CONNECTION_STRING"
DIRECT_URL="$CONNECTION_STRING"

# PostgreSQL bağlantı bilgileri (yedek)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nown
DB_USER=nownuser
DB_PASSWORD=$DB_PASSWORD
EOF

echo -e "${BLUE}ℹ Database bilgileri kaydedildi: /root/nown-db-credentials.txt${NC}"
echo ""
echo "Bu dosyayı görüntülemek için:"
echo "cat /root/nown-db-credentials.txt"
echo ""

