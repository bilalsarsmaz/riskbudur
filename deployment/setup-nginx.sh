#!/bin/bash

###############################################################################
# Nginx Reverse Proxy Yapılandırma Scripti
###############################################################################

set -e

echo "=================================================="
echo "🌐 Nginx Yapılandırması"
echo "=================================================="
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Root kontrolü
if [ "$EUID" -ne 0 ]; then 
    echo "Bu scripti root olarak çalıştırmalısınız: sudo bash setup-nginx.sh"
    exit 1
fi

read -p "Domain adınız (örn: nown.com veya subdomain.nown.com): " DOMAIN

echo ""
echo -e "${YELLOW}⚠️ Domain'in DNS ayarlarını yaptınız mı?${NC}"
echo "Domain'in A kaydı bu sunucunun IP adresine yönlendirilmeli."
echo ""
read -p "DNS ayarları yapıldı mı? (y/n): " DNS_READY

if [ "$DNS_READY" != "y" ]; then
    echo ""
    echo -e "${BLUE}ℹ DNS ayarlarını yapın ve sonra tekrar çalıştırın.${NC}"
    echo ""
    echo "DNS Ayarları:"
    echo "Tip: A"
    echo "Host: @ (veya subdomain)"
    echo "Value: $(curl -s ifconfig.me)"
    echo ""
    exit 0
fi

# Nginx config dosyası oluştur
cat > /etc/nginx/sites-available/nown <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Güvenlik headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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

    # Client max body size (dosya yüklemeleri için)
    client_max_body_size 10M;
}
EOF

# Symlink oluştur
ln -sf /etc/nginx/sites-available/nown /etc/nginx/sites-enabled/

# Default site'ı kaldır
rm -f /etc/nginx/sites-enabled/default

# Nginx test
echo ""
echo "Nginx yapılandırması test ediliyor..."
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx yapılandırması geçerli${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx yeniden yüklendi${NC}"
else
    echo -e "${RED}✗ Nginx yapılandırması hatalı${NC}"
    exit 1
fi

echo ""
echo "=================================================="
echo "🔒 SSL Sertifikası Kuruluyor (Let's Encrypt)"
echo "=================================================="
echo ""

# Certbot kurulumu
apt install -y certbot python3-certbot-nginx

# SSL sertifikası al
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ SSL sertifikası başarıyla kuruldu!${NC}"
    echo ""
    echo "=================================================="
    echo "✅ Nginx Yapılandırması Tamamlandı!"
    echo "=================================================="
    echo ""
    echo "🎉 Siteniz hazır!"
    echo "🌐 https://$DOMAIN"
    echo ""
    echo "Sertifika otomatik yenilenecek (90 günde bir)"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠ SSL sertifikası kurulamadı${NC}"
    echo "DNS ayarlarınızı kontrol edin ve tekrar deneyin:"
    echo "sudo certbot --nginx -d $DOMAIN"
    echo ""
    echo "Şimdilik HTTP üzerinden erişebilirsiniz:"
    echo "http://$DOMAIN"
    echo ""
fi

