# AI Destekli Grafik Yeniden Oluşturma

Üniversite ödevi projesi - Görüntülerden ve verilerden yapay zeka destekli grafik yeniden oluşturma sistemi.

## 📋 Proje Amacı

Bu proje, grafik görüntülerini ve CSV veri dosyalarını analiz ederek:
- Grafik türünü otomatik olarak tespit etme
- Tespit edilen grafiğe uygun R kodu üretme
- Harici R Plumber API'si ile grafik oluşturma isteklerini iletme

amacıyla geliştirilmiştir.

## 🛠️ Kullanılan Teknolojiler

### Frontend
- **HTML5** - Sayfa yapısı ve semantik işaretleme
- **CSS3** - Modern, temiz tasarım (açık tema, ortalanmış düzen)
- **Vanilla JavaScript** - Dosya yükleme, API çağrıları, UI güncellemeleri

### Backend
- **Python 3.x** - Backend programlama dili
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin kaynak paylaşımı
- **Requests** - HTTP istekleri için

### Gelecekteki Entegrasyonlar
- **R Plumber API** - Grafik oluşturma servisi
- **NotebookLM** - Doküman analizi ve kod üretimi
- **Google AI Studio / Gemini** - Görüntü analizi ve doğal dil işleme
  - Gemini Vision API - Grafik görüntü analizi
  - Gemini Text API - R kodu üretimi

## 📁 Proje Yapısı

```
Yazılım_gerçekleme/
├── backend/
│   ├── app.py              # Flask sunucusu (LLM entegrasyon noktaları ile)
│   ├── requirements.txt    # Python bağımlılıkları
│   ├── uploads/            # Yüklenen dosyalar için klasör
│   └── venv/               # Python sanal ortamı
├── frontend/
│   ├── index.html          # Ana sayfa (4 bölümlü yapı)
│   ├── style.css           # Stil dosyası (açık tema)
│   └── app.js              # Frontend mantığı
└── README.md               # Bu dosya
```

## 🚀 Kurulum ve Çalıştırma

### Ön Gereksinimler
- Python 3.8 veya üzeri
- Modern web tarayıcısı (Chrome, Firefox, Edge)

### 1. Backend Kurulumu

#### Sanal Ortamı Aktifleştirme

**Windows:**
```bash
cd backend
venv\Scripts\activate
```

**macOS/Linux:**
```bash
cd backend
source venv/bin/activate
```

#### Bağımlılıkları Yükleme

```bash
pip install -r requirements.txt
```

#### Flask Sunucusunu Başlatma

```bash
python app.py
```

Sunucu `http://localhost:5000` adresinde çalışmaya başlayacaktır.

### 2. Frontend Çalıştırma

#### Basit HTTP Sunucusu ile (Önerilen)

```bash
cd frontend
python -m http.server 8080
```

Tarayıcınızda `http://localhost:8080` adresini açın.

#### Veya Doğrudan Tarayıcıda

`frontend/index.html` dosyasını doğrudan tarayıcınızda açabilirsiniz.

## 📖 Kullanım

### Adım 1: Grafik Görüntüsü Yükleme
- "1. Upload Chart Image" bölümünden bir grafik görüntüsü (PNG/JPG) seçin
- Görüntü önizlemesi otomatik olarak görünecektir

### Adım 2: CSV Veri Dosyası Yükleme (Opsiyonel)
- "2. Upload CSV Dataset" bölümünden bir CSV dosyası seçin
- Dosya bilgileri görüntülenecektir

### Adım 3: Görüntüyü Analiz Etme
- "🔍 Analyze Image" butonuna tıklayın
- Tespit edilen grafik türü ve üretilen R kodu görüntülenecektir

### Adım 4: R API'sine Grafik İsteği Gönderme
- İsteğe bağlı olarak özelleştirme seçenekleri girin
- "📈 Request Plot from R API" butonuna tıklayın
- R API yanıtı görüntülenecektir

## 🔌 API Endpoints

### `POST /api/analyze-image`
Yüklenen grafik görüntüsünü analiz eder.

**İstek:** `multipart/form-data` ile `image` dosyası

**Yanıt:**
```json
{
  "success": true,
  "chart_type": "bar_chart",
  "confidence": 92,
  "detected_features": {
    "has_title": true,
    "has_legend": false,
    "x_axis_label": "Categories",
    "y_axis_label": "Values"
  },
  "example_r_code": "# R kodu...",
  "llm_ready": false
}
```

### `POST /api/plot`
Grafik oluşturma isteğini R Plumber API'sine iletir.

**İstek:**
```json
{
  "chart_type": "bar_chart",
  "options": "Kullanıcı seçenekleri",
  "data_summary": {}
}
```

**Yanıt:**
```json
{
  "success": true,
  "r_response": {},
  "message": "Plot request forwarded to R API",
  "is_mock": true
}
```

### `GET /api/health`
Sistem durumu kontrolü.

**Yanıt:**
```json
{
  "status": "healthy",
  "service": "chart-reconstruction-api",
  "version": "1.0.0",
  "llm_integration": {
    "status": "Ready for integration"
  }
}
```

## 🔮 Gelecek Çalışmalar

### 1. LLM Entegrasyonu

#### Görüntü Analizi (Gemini Vision)
- [ ] Google AI Studio API anahtarı yapılandırması
- [ ] Gemini Vision API entegrasyonu
- [ ] Grafik türü tespiti için prompt mühendisliği
- [ ] Özellik çıkarımı (başlık, eksen etiketleri, veri noktaları)
- [ ] Güven skoru hesaplama

#### R Kodu Üretimi (Gemini Text)
- [ ] Bağlam farkındalıklı kod üretimi
- [ ] Tespit edilen özelliklere göre özelleştirme
- [ ] Veri yapısı analizi
- [ ] Üretilen kodun doğrulanması

#### Doğal Dil İşleme
- [ ] Kullanıcı seçeneklerini LLM ile ayrıştırma
- [ ] Doğal dil komutlarını R parametrelerine dönüştürme

### 2. R Plumber API Geliştirme

- [ ] R Plumber API oluşturma (`http://localhost:8000`)
- [ ] Grafik oluşturma endpoint'i (`/plot`)
- [ ] ggplot2 ile dinamik grafik üretimi
- [ ] Base64 veya dosya yolu olarak grafik döndürme
- [ ] Hata yönetimi ve doğrulama

### 3. Veri İşleme İyileştirmeleri

- [ ] CSV ayrıştırma (pandas veya PapaParse)
- [ ] Sütun tipi tespiti
- [ ] Veri önizleme gösterimi
- [ ] Otomatik sütun eşleştirme (x, y, fill, color)
- [ ] Veri ön işleme adımları

### 4. Frontend Geliştirmeleri

- [ ] Gerçek zamanlı grafik önizlemesi
- [ ] Üretilen grafikleri indirme
- [ ] Grafik geçmişi
- [ ] Gelişmiş özelleştirme seçenekleri
- [ ] Karanlık mod desteği

### 5. Üretim Hazırlığı

- [ ] Ortam değişkenleri yapılandırması
- [ ] Hata loglama sistemi
- [ ] Kullanıcı kimlik doğrulaması
- [ ] Oran sınırlama (rate limiting)
- [ ] Dosya depolama optimizasyonu
- [ ] Docker containerization
- [ ] Deployment dokümantasyonu

## 📚 Kod İçi Dokümantasyon

`backend/app.py` dosyası, LLM entegrasyonu için detaylı yorumlar içerir:

- **Entegrasyon Noktası #1:** Görüntü analizi (satır 56-120)
- **Entegrasyon Noktası #2:** R kodu üretimi (satır 177-230)
- **Entegrasyon Noktası #3:** R Plumber API iletişimi (satır 308-370)

Her entegrasyon noktası şunları içerir:
- Mevcut placeholder uygulaması
- Gelecekteki LLM entegrasyon kodu örnekleri
- Adım adım talimatlar
- Örnek prompt'lar ve yanıtlar

## 🧪 Test Etme

### Backend Sağlık Kontrolü
```bash
curl http://localhost:5000/api/health
```

### Görüntü Analizi Testi
```bash
curl -X POST -F "image=@test_chart.png" http://localhost:5000/api/analyze-image
```

### Grafik İsteği Testi
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"chart_type":"bar_chart","options":"test"}' \
  http://localhost:5000/api/plot
```

## 🤝 Katkıda Bulunma

Bu bir üniversite ödevi projesidir. Öneriler ve iyileştirmeler için:
1. Kodu inceleyin
2. İyileştirme önerileri yapın
3. LLM entegrasyon noktalarını değerlendirin

## Teşekkürler

Bu projenin geliştirilmesinde değerli katkıları ve rehberliği için:

- **Nurettin Şenyer Hocam**'a
- **Ömer Durmuş Hocam**'a

teşekkürlerimi sunarım.

## 📄 Lisans

Üniversite Ödevi Projesi - Eğitim Amaçlı

## 👥 Geliştirici Notları

### Placeholder Mod
Proje şu anda **placeholder modunda** çalışmaktadır:
- Grafik tespiti simüle edilmiştir
- R kodu şablonlardan üretilmektedir
- R API yanıtları mock'lanmıştır

### LLM Entegrasyonu İçin Hazır
Kod, LLM entegrasyonu için hazır durumdadır:
- Tüm entegrasyon noktaları işaretlenmiştir
- Örnek kod parçacıkları eklenmiştir
- API yapısı LLM yanıtlarını desteklemektedir

### Önerilen Geliştirme Sırası
1. ✅ Temel frontend ve backend yapısı (Tamamlandı)
2. ⏳ R Plumber API kurulumu
3. ⏳ Gemini Vision API entegrasyonu
4. ⏳ R kodu üretimi için Gemini Text API
5. ⏳ CSV veri işleme
6. ⏳ Üretim ortamı hazırlığı

---

**Son Güncelleme:** 5 Aralık 2025  
**Versiyon:** 1.0.0  
**Durum:** Geliştirme Aşamasında (Placeholder Mod)
