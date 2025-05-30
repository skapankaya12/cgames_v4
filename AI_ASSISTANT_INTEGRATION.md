# AI İK Asistanı - Kullanım Kılavuzu

## 🤖 Genel Bakış

AI İK Asistanı, aday değerlendirme sürecini desteklemek için geliştirilmiş conversational AI özelliğidir. HR uzmanları, adaylar hakkında detaylı sorular sorabilir ve AI'dan özelleştirilmiş yanıtlar alabilir.

## ✨ Özellikler

### 🎯 Temel İşlevler
- **Konuşmalı AI**: Doğal dilde soru-cevap
- **Bağlamsal Yanıtlar**: Aday verileri (skorlar + CV) ile özelleştirilmiş
- **Çoklu Format Desteği**: Email, mülakat soruları, değerlendirme raporları
- **Gerçek Zamanlı**: Anlık AI yanıtları
- **Minimize Edilebilir**: Ekran alanından tasarruf

### 📊 Kullanılan Veriler
- **Yetkinlik Skorları**: 8 farklı yetkinlik alanı analizi
- **CV Analizi**: Deneyim, beceriler, eğitim bilgileri
- **Davranışsal Veriler**: Test sırasındaki etkileşimler
- **Geçmiş Konuşma**: Conversation context

## 🚀 Kullanım Örnekleri

### 💼 Email Taslakları
```
"Bu aday için bir kabul emaili taslağı hazırla"
"Red emaili yazabilir misin?"
```

### ❓ Mülakat Soruları
```
"Bu adayın zayıf yönlerini test edecek mülakat soruları öner"
"Liderlik potansiyelini değerlendirmek için hangi sorular sormeliyim?"
```

### 📈 Gelişim Önerileri
```
"Bu adayın gelişim planını hazırla"
"Hangi eğitimleri önerirsin?"
```

### 🎯 Pozisyon Uygunluğu
```
"Bu aday hangi pozisyonlara uygun?"
"Takım liderliği rolü için nasıl?"
```

### ⚠️ Risk Analizi
```
"Bu adayın işe alım risklerini değerlendir"
"Dikkat etmemiz gereken noktalar neler?"
```

## 🛠️ Teknik Detaylar

### 🔧 Teknoloji Stack
- **AI Engine**: Google Gemini 1.5 Flash
- **Frontend**: React TypeScript
- **Styling**: Modern CSS with gradients
- **State Management**: React Hooks
- **Data Integration**: Session Storage

### 📝 Veri Akışı
1. **Aday Testi** → Yetkinlik skorları oluşturulur
2. **CV Yükleme** → CV analizi yapılır (opsiyonel)
3. **AI Chat** → Tüm veriler birleştirilerek context oluşturulur
4. **Prompt Engineering** → HR soruları AI'a özelleştirilmiş formatta gönderilir
5. **Yanıt Üretimi** → AI, aday verilerine dayalı yanıt üretir

### 🎨 UI/UX Özellikleri
- **Modern Tasarım**: Gradient backgrounds, glassmorphism
- **Responsive**: Mobile ve desktop uyumlu
- **Accessibility**: Screen reader friendly
- **Performance**: Lazy loading, efficient re-renders
- **User Experience**: Typing indicators, smooth animations

## 💡 İpuçları

### 🎯 Etkili Soru Sorma
1. **Spesifik Olun**: "Mülakat soruları" yerine "Liderlik becerilerini test edecek mülakat soruları"
2. **Format Belirtin**: "Email formatında", "Numaralı liste halinde"
3. **Bağlam Ekleyin**: "Bu pozisyon için", "takım liderliği rolü için"

### 📊 Veri Kalitesi
- **Tam CV**: Daha detaylı analizler için CV yükleyin
- **Test Tamamlama**: Tüm soruları cevaplayın
- **Doğru Bilgiler**: Aday bilgilerinin doğru olduğundan emin olun

### 🔒 Güvenlik
- **Veri Gizliliği**: Tüm veriler session storage'da saklanır
- **API Güvenliği**: Google AI API key environment variable'da
- **Oturum Bazlı**: Her test oturumu izole edilmiştir

## 🚀 Gelecek Özellikler

### 🎯 Planlanan Geliştirmeler
- **Conversation History**: Geçmiş konuşmaları kaydetme
- **Export Options**: Chat geçmişini PDF olarak kaydetme
- **Team Integration**: Takım üyeleriyle chat paylaşma
- **Advanced Analytics**: AI yanıt kalitesi metrikleri
- **Custom Prompts**: Şirket özel prompt şablonları

### 🔧 Teknik İyileştirmeler
- **Offline Mode**: İnternet bağlantısı olmadan temel özellikler
- **Multi-language**: Çoklu dil desteği
- **Voice Input**: Sesli komut desteği
- **Smart Suggestions**: ML tabanlı soru önerileri

## 📞 Destek

### 🐛 Sorun Giderme
1. **AI Yanıt Alamıyorum**: API key'i kontrol edin
2. **Chat Açılmıyor**: Browser console'unda hata var mı?
3. **Yavaş Yanıt**: İnternet bağlantınızı kontrol edin

### 📝 Feedback
AI asistanı sürekli geliştirilmektedir. Geri bildirimlerinizi paylaşmaktan çekinmeyin!

---

*Bu dokümantasyon v1.0 için hazırlanmıştır. Son güncellemeler için kod repository'sini kontrol edin.* 