# Beşiktaş Belediyesi Kurumsal Görsel Arşiv Sistemi

Beşiktaş Belediyesi için geliştirilen; fotoğraf, video, grafik tasarım ve haber bülteni içeriklerini yöneten kurumsal arşiv uygulamasıdır.

## Özellikler

- Kurumsal kullanıcı kaydı ve rol tabanlı yetkilendirme
- Fotoğraf/video yükleme ve nesne depolama
- Müdürlük, konum, tarih, kişi etiketi ve anahtar kelime ile arama
- Yönetici onaylı analiz kuyruğu
- Haber bülteni ve sosyal medya iş akışları
- Faaliyet raporları ve işlem kayıtları
- BİO Fotoğraf/Video, Haber Bültenleri, Grafik Tasarım ve Sosyal Medya sorumluluk rolleri

## Yerel kontrol

```bash
npm run validate
npm run build
```

## Güvenlik ve veri

Bu açık kaynak deposunda üretim veritabanı, kullanıcı kayıtları, yüklenen kurum içerikleri, kişi referans fotoğrafları, API anahtarları ve çalışma zamanı gizli değerleri bulunmaz. Bunlar dağıtım ortamında ayrıca tanımlanmalıdır.

Gerekli çalışma zamanı değişkenleri:

- `OPENAI_API_KEY`
- `WATERMARK_SECRET`

Kalıcı veri için D1 uyumlu veritabanı, dosyalar için R2 uyumlu nesne depolama kullanılır.
