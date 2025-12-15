# Layout Kullanım Kılavuzu

Riskbudur projesi için standartlaştırılmış sayfa layout sistemleri.

## 📐 Layout Tipleri

### 1. **StandardPageLayout** (S + M + R)
3 kolonlu standart layout: Sol Sidebar + Orta İçerik + Sağ Sidebar

**Yapı:**
- **Sol Sidebar**: 88px (md ekran) → 275px (xl ekran)
- **Orta İçerik**: Max 600px genişlik
- **Sağ Sidebar**: 350px (lg+ ekranlarda görünür)

**Kullanım:**
```tsx
import StandardPageLayout from '@/components/StandardPageLayout';

export default function YeniSayfa() {
  return (
    <StandardPageLayout>
      <div className="p-4">
        <h1>Sayfa İçeriği</h1>
      </div>
    </StandardPageLayout>
  );
}
```

**Props:**
- `children`: Sayfa içeriği
- `showLeftSidebar?: boolean` (default: true)
- `showRightSidebar?: boolean` (default: true)
- `className?: string` - Orta section için ek CSS sınıfları

**Örnek Kullanımlar:**
- Ana sayfa (`/home`)
- Profil sayfası (`/[username]`)
- Keşfet (`/explore`)
- Bildirimler (`/notifications`)
- Statik sayfalar (`/about`, `/terms`, vb.)

---

### 2. **SecondaryLayout** (S + MR)
2 kolonlu geniş layout: Sol Sidebar + Geniş İçerik Alanı

**Yapı:**
- **Sol Sidebar**: 88px (md ekran) → 275px (xl ekran)
- **Geniş İçerik**: Default max 900px (özelleştirilebilir)

**Kullanım:**
```tsx
import SecondaryLayout from '@/components/SecondaryLayout';

export default function GenisSayfa() {
  return (
    <SecondaryLayout maxWidth="1200px">
      <div className="p-6">
        <h1>Geniş İçerik</h1>
        <p>Sağ sidebar olmadan daha fazla alan</p>
      </div>
    </SecondaryLayout>
  );
}
```

**Props:**
- `children`: Sayfa içeriği
- `showLeftSidebar?: boolean` (default: true)
- `maxWidth?: string` (default: "900px")
- `className?: string` - İçerik section için ek CSS sınıfları

**Örnek Kullanımlar:**
- Ayarlar sayfası
- Tam genişlik tablolar
- Dashboard görünümleri
- Medya galerisi

---

## 📱 Responsive Davranış

Her iki layout da otomatik responsive:

### Desktop (lg+, 1024px+)
- StandardPageLayout: 3 kolon görünür
- SecondaryLayout: 2 kolon görünür

### Tablet (md-lg, 768px-1023px)
- Sol sidebar görünür (88px)
- Sağ sidebar gizli
- İçerik tam genişlik

### Mobile (<768px)
- Sidebar'lar gizli
- Sadece içerik görünür
- Alt navbar aktif (`MobileBottomNav`)

---

## 🎨 Tema Entegrasyonu

Her iki layout da CSS değişkenleri kullanır:
- `--app-body-bg`: Arka plan rengi
- `--app-border`: Border rengi (tema değişkeninden)

---

## 🚀 Hızlı Başlangıç

### Barrel Import (Önerilen)
```tsx
import { StandardPageLayout, SecondaryLayout } from '@/components/layouts';
```

### Direkt Import
```tsx
import StandardPageLayout from '@/components/StandardPageLayout';
import SecondaryLayout from '@/components/SecondaryLayout';
```

---

## ✅ Avantajlar

1. **Tutarlılık**: Tüm sayfalarda aynı layout kuralları
2. **Responsive**: Otomatik mobil uyumluluk
3. **Esneklik**: Sidebar'ları açıp kapatabilme
4. **Bakım Kolaylığı**: Layout değişiklikleri tek yerden
5. **Tema Uyumluluğu**: Otomatik dark/light tema desteği

---

## 📋 Checklist: Yeni Sayfa Oluştururken

- [ ] Layout tipini belirle (Standard vs Secondary)
- [ ] Import et
- [ ] `children` içine içerik ekle
- [ ] Gerekirse sidebar'ları devre dışı bırak
- [ ] Mobile görünümünü test et
