# Craftnet API

Ustalar ve müşteriler platformu için REST API servisleri. Bu proje, müşterilerin usta aramasını ve ustaların hizmetlerini sunmasını sağlayan bir platform için arka uç API hizmetlerini içerir.

## Özellikler

- Kullanıcı (Müşteri) kaydı ve girişi
- Usta kaydı ve girişi (3 kategori ve şehir seçimi ile)
- Şifre hashleme (bcrypt)
- JWT token tabanlı kimlik doğrulama
- Kullanıcı tipi kontrolü (Müşteri / Usta)
- Kullanıcı bilgilerini getiren "me" endpoint'i
- İlan oluşturma ve yönetimi
- İlan listeleme ve detay görüntüleme
- İlanları şehir, kategori ve başlığa göre filtreleme
- Müşteri telefon bilgisi sorgulama
- Ustaların ilanlara teklif vermesi
- Müşterilerin ilanlarına gelen teklifleri görüntülemesi
- Ustaların verdikleri teklifleri görüntülemesi
- Müşterinin usta teklifini kabul etmesi ve işi başlatması
- Müşterinin devam eden işlerini görüntülemesi
- Ustanın kendisine atanmış devam eden işleri görüntülemesi
- Kullanıcıların ve ustaların devam eden işlerinin sayısını görüntülemesi
- Ustanın tamamlanmış işlerini ve aldığı değerlendirmeleri görüntülemesi
- Müşterinin işi tamamlanmış olarak işaretlemesi ve ustaya değerlendirme yapması
- Ustaların listesini ortalama değerlendirme puanlarıyla görüntüleme
- Usta profilini detaylı istatistiklerle görüntüleme
- Ustanın sadece iş yaptığı kategorilere göre performansını görüntüleme
- Ustanın belirli bir kategorideki tamamlanmış işlerini ve değerlendirmelerini görüntüleme

## Teknolojiler

- Node.js
- Express.js
- MySQL
- JWT
- Bcrypt

## Kurulum

1. Bağımlılıkları yükleyin:
```
yarn install
```

2. `.env` dosyasını düzenleyin:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=craftnet
JWT_SECRET=craft_net_super_secret_key_2024
JWT_EXPIRES_IN=7d
```

3. Veritabanını oluşturun:
```
yarn init-db
```

4. API'yi başlatın:
```
yarn start
```

Geliştirme modunda başlatmak için:
```
yarn dev
```

## API Endpoint'leri

### Kimlik Doğrulama

- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/master/register` - Usta kaydı
- `POST /api/auth/master/login` - Usta girişi
- `GET /api/auth/me` - Oturum açmış kullanıcı bilgileri

### Kullanıcılar

- `GET /api/users/phone/:customer_id` - Müşteri telefon bilgisini getirme

### Kategoriler

- `GET /api/categories` - Tüm kategorileri getirme

### Şehirler

- `GET /api/cities` - Tüm şehirleri getirme

### İlanlar

- `POST /api/jobs` - Yeni ilan oluşturma (auth gerekli, sadece kullanıcılar)
- `GET /api/jobs/user/my-jobs` - Kullanıcının kendi ilanlarını görüntüleme (auth gerekli, sadece kullanıcılar)
- `GET /api/jobs/user/my-jobs?status=pending|in_progress|completed` - Kullanıcının duruma göre filtrelenmiş ilanlarını görüntüleme
- `GET /api/jobs/user/in-progress` - Kullanıcının devam eden işlerini görüntüleme (auth gerekli, sadece kullanıcılar)
- `GET /api/jobs/master/in-progress` - Ustanın kendisine atanmış devam eden işleri görüntüleme (auth gerekli, sadece ustalar)
- `GET /api/jobs/master/completed` - Ustanın tamamlanmış işlerini ve aldığı değerlendirmeleri görüntüleme (auth gerekli, sadece ustalar)
- `GET /api/jobs/in-progress/count` - Devam eden işlerin sayısını görüntüleme (auth gerekli, hem kullanıcılar hem ustalar)
- `POST /api/jobs/accept-proposal` - Usta teklifini kabul etme ve işi başlatma (auth gerekli, sadece kullanıcılar, body: {job_id, master_id})
- `POST /api/jobs/complete` - İşi tamamlanmış olarak işaretleme ve ustaya değerlendirme yapma (auth gerekli, sadece kullanıcılar, body: {job_id, rating, comment})
- `GET /api/jobs/pending` - Bekleyen (pending) durumundaki tüm ilanları getirme
- `GET /api/jobs/filter` - İlanları şehir, kategori ve başlığa göre filtreleme (query parametreleri: city_id, category_id, title)
- `GET /api/jobs/:id` - İlan detaylarını görüntüleme

### Teklifler

- `POST /api/proposals` - Yeni teklif oluşturma (auth gerekli, sadece ustalar)
- `GET /api/proposals/master/my-proposals` - Ustanın kendi tekliflerini görüntüleme (auth gerekli, sadece ustalar)
- `GET /api/proposals/job/:job_id` - İlana gelen teklifleri görüntüleme (auth gerekli, sadece ilanın sahibi olan müşteri)
- `GET /api/proposals/count/:job_id` - İlana gelen teklif sayısını görüntüleme

### Ustalar

- `GET /api/masters` - Tüm ustaların listesini ortalama değerlendirme puanları, şehir bilgileri ve kategori ID'leriyle görüntüleme
- `GET /api/masters/my-info` - Giriş yapmış ustanın şehir ve kategori ID'lerini görüntüleme (auth gerekli, sadece ustalar)
- `GET /api/masters/:id/profile` - Usta profilini detaylı istatistiklerle görüntüleme (ortalama puan, tamamlanan iş sayısı, beceriler)
- `GET /api/masters/:id/performance` - Ustanın sadece iş yaptığı kategorilere göre performansını görüntüleme (her kategoride ortalama puan ve tamamlanan iş sayısı)
- `GET /api/masters/:id/completed-jobs/:category_id` - Ustanın belirli bir kategorideki tamamlanmış işlerini ve değerlendirmelerini görüntüleme 