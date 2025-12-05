# Vibe_Chart - AI Destekli Grafik Yeniden Oluşturma

Üniversite ödevi projesi - Dataset-driven grafik üretim sistemi ile yapay zeka destekli grafik yeniden oluşturma.

## 📋 Proje Amacı

Bu proje, veri setlerinden otomatik grafik üretimi ve mevcut grafik görüntülerini analiz ederek:
- CSV ve Excel dosyalarından veri yükleme
- Sütun tiplerini otomatik tespit etme (numeric/categorical)
- 10+ farklı grafik tipi üretme
- Dataset ve grafik tipi uyumluluğunu kontrol etme
- Grafik görüntülerini analiz etme (LLM entegrasyonu için hazır)

amacıyla geliştirilmiştir.

## 🛠️ Kullanılan Teknolojiler

### Frontend
- **HTML5** - Üç bölümlü modern arayüz
- **CSS3** - Temiz, responsive tasarım
- **Vanilla JavaScript** - Dataset yükleme, dinamik grafik üretimi, API entegrasyonu

### Backend
- **Python 3.x** - Backend programlama dili
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin kaynak paylaşımı
- **Pandas** - Veri analizi ve CSV/Excel okuma
- **Matplotlib** - Grafik üretimi
- **Seaborn** - Gelişmiş istatistiksel görselleştirmeler
- **OpenPyXL** - Excel dosya desteği

### Gelecekteki Entegrasyonlar
- **Google AI Studio / Gemini Vision** - Grafik görüntü analizi
- **NotebookLM** - Doküman analizi ve kod üretimi
- **R Plumber API** - Gelişmiş R tabanlı grafik üretimi (opsiyonel)

## 📁 Proje Yapısı

```
Vibe_Chart/
├── backend/
│   ├── app.py              # Flask sunucusu (10+ grafik tipi)
│   ├── requirements.txt    # Python bağımlılıkları
│   └── uploads/            # Yüklenen dosyalar
├── frontend/
│   ├── index.html          # Ana sayfa (3 bölümlü)
│   ├── style.css           # Modern stil
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

Yüklenecek kütüphaneler:
- Flask 3.0.0
- Flask-CORS 4.0.0
- Pandas 2.1.4
- Matplotlib 3.8.2
- Seaborn 0.13.0
- OpenPyXL 3.1.2

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

### Bölüm 1: Dataset Yükleme ve Sütun Keşfi

1. **CSV veya Excel Dosyası Yükleyin**
   - "Choose dataset file" butonuna tıklayın
   - CSV (.csv) veya Excel (.xlsx, .xls) dosyası seçin
   - "Upload Dataset" butonuna tıklayın

2. **Sütun Bilgilerini İnceleyin**
   - Sütun adları
   - Sütun tipleri (numeric/categorical)
   - Örnek değerler

### Bölüm 2: Dataset'ten Grafik Üretme

1. **Grafik Tipi Seçin**
   - Dropdown menüden 10 grafik tipinden birini seçin
   - Gereksinimler otomatik gösterilir

2. **Sütunları Seçin**
   - X sütunu (genellikle categorical)
   - Y sütunu (genellikle numeric)
   - Grup sütunu (bazı grafik tipleri için)

3. **Grafik Üretin**
   - "Generate Chart" butonuna tıklayın
   - Grafik önizlemesi görüntülenir

### Bölüm 3: Mevcut Grafik Görüntüsünü Analiz Etme

1. **Grafik Görüntüsü Yükleyin**
   - PNG veya JPG formatında grafik görüntüsü seçin
   - "Analyze Image" butonuna tıklayın

2. **Analiz Sonuçlarını Görüntüleyin**
   - Tespit edilen grafik tipi
   - Güven skoru (placeholder mod)
   - Örnek R kodu

3. **Uyumluluk Kontrolü** (Dataset yüklüyse)
   - Sistem otomatik olarak dataset uyumluluğunu kontrol eder
   - Uyumluysa: "Generate This Chart with My Data" butonu görünür
   - Uyumlu değilse: Açıklayıcı hata mesajı gösterilir

## 📊 Desteklenen Grafik Tipleri

| Grafik Tipi | Gereksinimler | Kullanım Alanı |
|-------------|---------------|----------------|
| **Bar Chart** | 1 categorical (x) + 1 numeric (y) | Kategoriler arası karşılaştırma |
| **Line Chart** | 1 x + 1 numeric (y) | Zaman serisi, trend analizi |
| **Scatter Plot** | 2 numeric (x, y) | Korelasyon analizi |
| **Histogram** | 1 numeric | Dağılım analizi |
| **Box Plot** | 1 numeric + optional categorical | İstatistiksel dağılım |
| **Heatmap** | 2 categorical + 1 numeric | İki boyutlu veri yoğunluğu |
| **Pie Chart** | 1 categorical + 1 numeric | Oran gösterimi |
| **Violin Plot** | 1 numeric + optional categorical | Dağılım yoğunluğu |
| **Area Chart** | 1 x + 1 numeric (y) | Kümülatif değişim |
| **Stacked Bar** | 2 categorical + 1 numeric | Çok katmanlı karşılaştırma |

## 🔌 API Endpoints

### `POST /api/upload-data`
Dataset yükleme ve analiz.

**İstek:** `multipart/form-data` ile `file` alanı

**Yanıt:**
```json
{
  "success": true,
  "dataset_id": "current",
  "rows": 100,
  "columns": [
    {
      "name": "City",
      "type": "categorical",
      "sample_values": ["Ankara", "İzmir", "İstanbul"]
    },
    {
      "name": "Sales",
      "type": "numeric",
      "sample_values": [1500, 2300, 1800]
    }
  ]
}
```

### `GET /api/chart-types`
Desteklenen grafik tiplerini listele.

**Yanıt:**
```json
{
  "success": true,
  "chart_types": [
    {
      "id": "bar",
      "label": "Bar Chart",
      "requirements": "1 categorical (x) + 1 numeric (y)"
    }
  ]
}
```

### `POST /api/generate-chart`
Dataset'ten grafik üret.

**İstek:**
```json
{
  "dataset_id": "current",
  "chart_type": "bar",
  "x_column": "City",
  "y_column": "Sales",
  "group_column": null
}
```

**Yanıt:**
```json
{
  "success": true,
  "compatible": true,
  "message": "Chart generated successfully",
  "image_base64": "data:image/png;base64,..."
}
```

### `POST /api/check-compatibility`
Dataset ve grafik tipi uyumluluğunu kontrol et.

**İstek:**
```json
{
  "dataset_id": "current",
  "chart_type": "scatter"
}
```

**Yanıt:**
```json
{
  "success": true,
  "chart_type": "scatter",
  "compatible": true,
  "reason": "Found 2 numeric columns",
  "suggested_columns": {
    "x_column": "Age",
    "y_column": "Income",
    "group_column": null
  }
}
```

### `POST /api/analyze-image`
Grafik görüntüsünü analiz et (placeholder mod).

**İstek:** `multipart/form-data` ile `image` dosyası

**Yanıt:**
```json
{
  "success": true,
  "chart_type": "bar",
  "confidence": 85,
  "detected_features": {...},
  "example_r_code": "# R code...",
  "llm_mode": "placeholder"
}
```

### `GET /api/health`
Sistem durumu kontrolü.

**Yanıt:**
```json
{
  "status": "healthy",
  "service": "vibe-chart-api",
  "version": "2.0.0",
  "features": {
    "dataset_upload": true,
    "chart_generation": true,
    "chart_types_count": 10
  },
  "dataset": {
    "loaded": true,
    "rows": 100,
    "columns": 5
  }
}
```

## 🔮 Özellikler

### ✅ Mevcut Özellikler

- **Dataset Yükleme**: CSV ve Excel dosya desteği
- **Otomatik Sütun Analizi**: Numeric/categorical tip tespiti
- **10 Grafik Tipi**: Matplotlib/Seaborn ile profesyonel grafikler
- **Akıllı Uyumluluk Kontrolü**: Dataset-grafik uyumu otomatik kontrol
- **Dinamik UI**: Grafik tipine göre değişen form alanları
- **Grafik Önizleme**: Base64 encoded PNG görüntüleme
- **Otomatik Sütun Önerisi**: Uyumlu sütunları otomatik seçme

### 🔄 Gelecek Geliştirmeler

#### LLM Entegrasyonu (Gemini Vision)
- [ ] Google AI Studio API yapılandırması
- [ ] Gerçek grafik tipi tespiti
- [ ] Özellik çıkarımı (başlık, eksen etiketleri)
- [ ] Güven skoru hesaplama

#### Veri İşleme
- [ ] CSV önizleme gösterimi
- [ ] Veri temizleme seçenekleri
- [ ] Eksik veri yönetimi
- [ ] Veri dönüşümleri

#### Grafik Özelleştirme
- [ ] Renk paleti seçimi
- [ ] Başlık ve etiket düzenleme
- [ ] Grafik boyutu ayarlama
- [ ] Tema seçenekleri

#### Üretim Hazırlığı
- [ ] Kullanıcı kimlik doğrulaması
- [ ] Session yönetimi (global state yerine)
- [ ] Veritabanı entegrasyonu
- [ ] Docker containerization
- [ ] API rate limiting

## 🧪 Test Etme

### Backend API Testleri

**Dataset Yükleme:**
```bash
curl -X POST -F "file=@test_data.csv" http://localhost:5000/api/upload-data
```

**Grafik Üretme:**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"dataset_id":"current","chart_type":"bar","x_column":"City","y_column":"Sales"}' \
  http://localhost:5000/api/generate-chart
```

**Uyumluluk Kontrolü:**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"dataset_id":"current","chart_type":"scatter"}' \
  http://localhost:5000/api/check-compatibility
```

### Frontend Testi

1. Backend'i başlatın: `python app.py`
2. Frontend'i açın: `frontend/index.html`
3. Test CSV dosyası yükleyin
4. Farklı grafik tiplerini deneyin
5. Görüntü analizi özelliğini test edin

## 📚 Kod İçi Dokümantasyon

### Backend (app.py)

**Helper Fonksiyonlar:**
- `infer_column_type()` - Sütun tipi tespiti
- `analyze_dataframe()` - DataFrame analizi
- `check_chart_compatibility()` - Uyumluluk kontrolü
- `generate_chart_matplotlib()` - Grafik üretimi

**LLM Entegrasyon Noktaları:**
- Satır 456-480: Görüntü analizi placeholder
- Gemini Vision API entegrasyon örnekleri
- Detaylı TODO yorumları

### Frontend (app.js)

**Ana Fonksiyonlar:**
- `uploadDataset()` - Dataset yükleme
- `loadChartTypes()` - Grafik tiplerini getir
- `generateChart()` - Grafik üret
- `analyzeImage()` - Görüntü analizi
- `checkCompatibility()` - Uyumluluk kontrolü
- `generateFromDetected()` - Otomatik sütun doldurma

## 🤝 Katkıda Bulunma

Bu bir üniversite ödevi projesidir. Öneriler ve iyileştirmeler için:
1. Kodu inceleyin
2. İyileştirme önerileri yapın
3. LLM entegrasyon noktalarını değerlendirin

## 🙏 Teşekkürler

Bu projenin geliştirilmesinde değerli katkıları ve rehberliği için:

- **Nurettin Şenyer Hocam**'a
- **Ömer Durmuş Hocam**'a

teşekkürlerimi sunarım.

## 📄 Lisans

Üniversite Ödevi Projesi - Eğitim Amaçlı

## 👥 Geliştirici Notları

### Mevcut Durum
- ✅ Dataset-driven grafik üretimi çalışıyor
- ✅ 10 grafik tipi destekleniyor
- ✅ Uyumluluk kontrolü aktif
- ⚠️ Görüntü analizi placeholder modda (LLM entegrasyonu bekleniyor)

### Teknik Detaylar
- **Global State**: Tek kullanıcı için uygun, production'da session bazlı olmalı
- **File Size Limit**: 16MB (gerekirse artırılabilir)
- **Chart Generation**: Matplotlib ile server-side rendering
- **Image Format**: Base64 encoded PNG

### Önerilen Geliştirme Sırası
1. ✅ Temel dataset ve grafik üretimi (Tamamlandı)
2. ⏳ Gemini Vision API entegrasyonu
3. ⏳ Gelişmiş veri işleme özellikleri
4. ⏳ Grafik özelleştirme seçenekleri
5. ⏳ Production ortamı hazırlığı

---

**Versiyon:** 2.0.0  
**Son Güncelleme:** 5 Aralık 2025  
**Durum:** Dataset-Driven Chart Generation - Aktif
