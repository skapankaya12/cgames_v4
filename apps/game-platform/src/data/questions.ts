interface Option {
  id: string;
  text: string;
  weights: CompetencyWeights;
  forwardingLine: string;
}

interface CompetencyWeights {
  [key: string]: number;
}

interface Question {
  id: number;
  text: string;
  forwardingLine: string;
  options: Option[];
}

export const questions: Question[] = [
  {
    id: 1,
    text: "Loş bir depo koridorundasın. Yük Sorumlusu soğuk bir bakışla sana bakıyor ve şöyle diyor:\n\"Kargoyu vermem için 8.000 Zenix ödemelisin.\"\nGörevine başlamadan önce bu engeli nasıl aşarsın?\nNe yaparsın?",
    forwardingLine: "Depodan çıktığında, dar ve kalabalık çıkış koridoruna yöneliyorsun.",
    options: [
      {
        id: "A",
        text: "Parayı anında eksiksiz masaya koyuyorum; itiraz beklemeden kargoyu hemen teslim alalım.",
        forwardingLine: "8.000 Zenix'i gözünü kırpmadan ödedin. Yük Sorumlusu başını sallar ve sana ağır bir kutu teslim eder. Cebin hafifledi ama görev başladı. Depodan çıkar çıkmaz, kalabalık bir çıkış koridoruna yöneliyorsun.",
        weights: {
          "DM": 5, "IN": 0, "AD": 1, "CM": 1, "ST": 2, "TO": 5, "RL": 4, "RI": 1
        }
      },
      {
        id: "B",
        text: "Teslimatı elden yapar yapmaz 8.000 Zenix'i derhal gönderirim; kargoyu hemen elden al.",
        forwardingLine: "Pazarlık teklifin önce bir sessizlik yaratıyor. Yük Sorumlusu başını sallar, \"İzini bırakma,\" diye uyararak yükü teslim eder. Sırtında sorumlulukla birlikte, çıkışa doğru yöneliyorsun; her adımın ardında bir şüphe var.",
        weights: {
          "DM": 3, "IN": 5, "AD": 3, "CM": 2, "ST": 4, "TO": 4, "RL": 3, "RI": 2
        }
      },
      {
        id: "C",
        text: "Sahte onay belgesi çıkarıp 'Kargo ücretsiz gönderiliyor' deyip belgeyi göstererek muhatabı ikna et.",
        forwardingLine: "Belgeyi gösterdiğinde gözleri kısılıyor ama kontrol etmeden teslim ediyor. Arkanı dönerken içeriden bir tıkırtı duyuyorsun. Hızla uzaklaşıyorsun; dar ve kalabalık çıkış koridoruna adım atarken nabzın hızlanmış durumda.",
        weights: {
          "DM": 4, "IN": 3, "AD": 3, "CM": 1, "ST": 3, "TO": 2, "RL": 1, "RI": 5
        }
      },
      {
        id: "D",
        text: "Bana bir saat süre ver; alternatif bir çözüm bulup geri dönüp kargoyu teslim edeceğim.",
        forwardingLine: "Süre talebin karşısında Yük Sorumlusu sadece omuz silkerek uzaklaşıyor. Depodan eli boş ama planlı şekilde çıkıyorsun. Kalabalık koridora girdiğinde yeni bir çözüm için aklın hızla çalışıyor.",
        weights: {
          "DM": 2, "IN": 2, "AD": 3, "CM": 2, "ST": 5, "TO": 1, "RL": 3, "RI": 2
        }
      }
    ]
  },
  {
    id: 2,
    text: "Depodan çıkıyorsun. Titreyen flüoresan ışıkların altında kalabalık bir insan seli var.\nÇıkış koridoru tıkalı. Gecikme riski oluşuyor.\nHangisini seçersin?",
    forwardingLine: "Kalabalığı yarıp ilerleyince, cam duvarlı toplantı odasının kapısına yaklaşıyorsun.",
    options: [
      {
        id: "A",
        text: "Hemen cüzdana uzanıp özel geçiş ücreti öde, kalabalığı atla.",
        forwardingLine: "Güvenlik görevlisine birkaç Zenix uzatıyorsun. Göz kontağı kurmadan turnikeyi açıyor. Kalabalığı arkanda bırakırken, cebinden çıkan parayla birlikte içindeki şüphe de büyüyor. Cam duvarlı toplantı odasının kapısına doğru ilerliyorsun.",
        weights: {
          "DM": 4, "IN": 2, "AD": 1, "CM": 1, "ST": 3, "TO": 5, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Kaçakçının gizli tüneline gir, kalabalığın altından ilerle.",
        forwardingLine: "Dar bir kapıdan içeri süzülüyorsun. Nemli, karanlık ve kimsenin bilmediği bir güzergâh. Arkandan kapı kapanırken tedirginlik yüzüne yansıyor. Tünelin sonunda ışık göz kırpıyor; artık toplantı odasının kapısındasın.",
        weights: {
          "DM": 3, "IN": 4, "AD": 5, "CM": 1, "ST": 2, "TO": 2, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Kalabalığın dağılmasını bekle; gece çıkışını kullan.",
        forwardingLine: "Kalabalığı izleyerek kenara çekiliyorsun. Dakikalar geçiyor, koridor yavaşça boşalıyor. Sessizliğin ardından adımların yankılanıyor. Beklemenin ardından, cam duvarlı toplantı odasının kapısına ulaşıyorsun.",
        weights: {
          "DM": 2, "IN": 1, "AD": 2, "CM": 2, "ST": 4, "TO": 1, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Motoru hızlıca yeniden ayarla, sistem çalışınca çıkış yap.",
        forwardingLine: "Bir köşeye çekilip çantandaki motoru kurcalıyorsun. Enerjiyle güçlendirilmiş ayakkabılarını aktive edip sessizce kalabalığı yarıyorsun. Teknoloji işe yarıyor: Toplantı odasının kapısına vardığında sistem hâlâ sıcak.",
        weights: {
          "DM": 3, "IN": 1, "AD": 3, "CM": 0, "ST": 5, "TO": 1, "RL": 5, "RI": 1
        }
      }
    ]
  },
  {
    id: 3,
    text: "Holografik bir odadasın. Parıldayan enerji çekirdeği önünde.\nRakip firma telsizle ulaşıyor:\n\"Yükü bize ver, iki katını ödeyelim.\"\nNe yaparsın?",
    forwardingLine: "Teklifi dinledikten sonra, hoparlörlerden gelen Devriye Gemisi anonsuna doğru yöneliyorsun.",
    options: [
      {
        id: "A",
        text: "Teklifi hiçbir pazarlık yapmadan derhal kabul edip, enerji çekirdeğini hemen rakiplere veriyorum.",
        forwardingLine: "El sıkışılır gibi bir sinyal alıyorsun, enerji çekirdeğini teslim ediyorsun. İçinde bir boşluk, cebinde ise iki kat ödeme var. Odadan ayrılırken hoparlörlerden bir anons yükseliyor: Devriye gemisi yaklaşıyor.",
        weights: {
          "DM": 5, "IN": 2, "AD": 1, "CM": 1, "ST": 3, "TO": 4, "RL": 1, "RI": 5
        }
      },
      {
        id: "B",
        text: "Gelin bu işten eşit kazanalım: %50 kârı paylaşalım\" diyerek ortaklık teklifi sunuyorum.",
        forwardingLine: "İletişim kanalında kısa bir sessizlik olur. \"İlginç teklif,\" der karşı taraf. Kesin bir anlaşma olmasa da, bağlantıyı açık bırakıyorlar. Tam o anda dışarıdan gelen motor sesi yankılanıyor: Devriye gemisi seni çağırıyor.",
        weights: {
          "DM": 3, "IN": 5, "AD": 3, "CM": 3, "ST": 4, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "C",
        text: "\"Hemen yanıt veremem, zamana ihtiyacım var\" diyerek duraklatıp vakit kazanmaya çalışıyorum.",
        forwardingLine: "Karşı taraf sabırsız ama seni hemen reddetmiyor. Süre kazanıyorsun ama onlar seni izliyor olabilir. Odadan çıkarken kulaklarında yankılanan sesle irkiliyorsun: Devriye gemisi seni tespit etti.",
        weights: {
          "DM": 3, "IN": 3, "AD": 3, "CM": 2, "ST": 3, "TO": 2, "RL": 1, "RI": 3
        }
      },
      {
        id: "D",
        text: "Bu teklifi kesinlikle reddedip, misyonu aksatmadan doğrudan hedefime devam ediyorum.",
        forwardingLine: "Kararını net veriyorsun: \"Hayır.\" Hattın öteki ucunda bir anlık sessizlik, ardından bağlantı kesiliyor. Bir iç huzurla kapıya yöneliyorsun. O anda dış hoparlörlerden yankılanan emir net: Devriye gemisi geliyor.",
        weights: {
          "DM": 4, "IN": 1, "AD": 2, "CM": 1, "ST": 5, "TO": 4, "RL": 5, "RI": 1
        }
      }
    ]
  },
  {
    id: 4,
    text: "Gökyüzünde bir gölge beliriyor. Telsizden sert bir ses yankılanıyor:\n\"Dur! Rutin kontrol.\"\nGemini durduruyorlar.\nNe yaparsın?",
    forwardingLine: "Tuzaktan sıyrıldıktan sonra, kokpitteki navigasyon ekranının başına geçiyorsun.",
    options: [
      {
        id: "A",
        text: "Evrakları hazırlayıp +500 Zenix rüşvet öde; geçişi hemen hızlandır.",
        forwardingLine: "Evrakları gösterip krediyi aktardığında bir iç çekiş olur. Komutan geçmeni onaylar ama sisteme işlenip işlenmediği meçhul. Navigasyon ekranına yönelirken arka planda bir veri sızıntısı alarmı çalıyor.",
        weights: {
          "DM": 3, "IN": 2, "AD": 1, "CM": 2, "ST": 4, "TO": 4, "RL": 4, "RI": 3
        }
      },
      {
        id: "B",
        text: "Komutanı yemeğe davet et, gönlünü alarak iznini sağla.",
        forwardingLine: "Telsizdeki ton yumuşar, \"Bir dahakine belki,\" diyerek seni geçişe izin verir. İletişim kurma becerin işe yaramıştır ama zaman kaybettin. Navigasyon ekranında rota yeniden beliriyor.",
        weights: {
          "DM": 2, "IN": 5, "AD": 3, "CM": 3, "ST": 3, "TO": 1, "RL": 3, "RI": 2
        }
      },
      {
        id: "C",
        text: "Kargoyu gizlice sakla, aramaya izin ver; sonra rahatça ilerle.",
        forwardingLine: "Arama başlıyor ama kargoyu zekice sakladın. Gerilim yüksek ama geçiş sağlandı. Kokpite geçtiğinde sistem hala kızarıyor; ama sen görevdesin.",
        weights: {
          "DM": 4, "IN": 2, "AD": 2, "CM": 1, "ST": 3, "TO": 2, "RL": 2, "RI": 5
        }
      },
      {
        id: "D",
        text: "Motorları çalıştır, fırsat doğar doğmaz doğrudan kaç.",
        forwardingLine: "Aniden hızlandın, devriye gemisi sesini yükseltti ama takip edemedi. Kaçış başarılı, ancak enerji seviyesi düşüyor. Navigasyon ekranında tekrar kontrol zamanı.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 0, "ST": 2, "TO": 2, "RL": 1, "RI": 5
        }
      }
    ]
  },
  {
    id: 5,
    text: "Karanlık kokpitte oturuyorsun. Navigasyon ekranı bozuldu.\nHarita bir rota öneriyor ama içgüdülerin başka bir yolu söylüyor.\nHangi yolu seçersin?",
    forwardingLine: "Rota ayarlarını yaptıktan hemen sonra, gökyüzünde beliren meteor tehdidine odaklanıyorsun.",
    options: [
      {
        id: "A",
        text: "Navigasyon sistemine tam güven; standart rotayı hiç tereddüt etmeden takip et.",
        forwardingLine: "Sistem seni alışılmış yoldan götürüyor, sakin ama kestirilebilir bir güzergâh. Gözlerin meteor uyarılarına takılıyor. Tehlike yaklaşıyor.",
        weights: {
          "DM": 4, "IN": 2, "AD": 2, "CM": 1, "ST": 5, "TO": 4, "RL": 5, "RI": 1
        }
      },
      {
        id: "B",
        text: "Haritayı bir kenara bırak, içgüdüyü dinle ve kestirme rotaya doğru sür.",
        forwardingLine: "Dönüşünü sert alıyorsun. Riskli ama hızlı bir rota çizdin. Yıldızlar yakınlaşıyor. Uzakta bir meteor hareketliliği başlıyor.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 0, "ST": 3, "TO": 4, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Hemen ekibi topla, çoğunluğun kararına göre rotayı belirle.",
        forwardingLine: "\"Çoğunluk A dedi,\" diyerek yön veriyorsun. Karar demokratik ama senin için tatmin edici mi? Meteor tehdidi uyarı vermeye başlıyor.",
        weights: {
          "DM": 2, "IN": 2, "AD": 3, "CM": 4, "ST": 3, "TO": 2, "RL": 4, "RI": 2
        }
      },
      {
        id: "D",
        text: "Bir saat boyunca dur, gözlemler yap; sonra en sağlıklı rotayı seç.",
        forwardingLine: "Süre kaybettin ama veri topladın. Gözlemler sonucunda rotayı yeniden çizersin. Gecikme pahasına meteor tehlikesine hazırlanıyorsun.",
        weights: {
          "DM": 3, "IN": 1, "AD": 4, "CM": 1, "ST": 5, "TO": 1, "RL": 3, "RI": 2
        }
      }
    ]
  },
  {
    id: 6,
    text: "Camın arkasında dev bir alev topu. Alarm zilleri çalıyor.\nÇarpma ihtimali yüksek. Kargo riskte.\nNe yaparsın?",
    forwardingLine: "Meteor bölgesini geride bırakıp, telsizden gelen kimlik kontrol sinyaline doğru ilerliyorsun.",
    options: [
      {
        id: "A",
        text: "Anteni derhal kopar, tüm enerjiyi gövde zırhına aktar; yaklaşan alev topunun etkisini en aza indir.",
        forwardingLine: "Veri kaybı yaşadın ama gemi sağlam kaldı. Kimlik kontrol sinyali devreye giriyor.",
        weights: {
          "DM": 4, "IN": 0, "AD": 2, "CM": 0, "ST": 2, "TO": 4, "RL": 3, "RI": 5
        }
      },
      {
        id: "B",
        text: "Kalkan jeneratörlerini maksimuma çek, motoru hızla ısıtarak savunmayı ve manevrayı güçlendir.",
        forwardingLine: "Kalkan seni korudu, ama motor performansı düştü. Telsizden gelen \"Kimliğini doğrula\" çağrısı seni irkiltiyor.",
        weights: {
          "DM": 3, "IN": 1, "AD": 2, "CM": 0, "ST": 3, "TO": 3, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Hemen mühendisi çağır, sıra dışı bir savunma modülü tasarlayıp uygulayın; meteorun yönünü saptırın.",
        forwardingLine: "Ekipten biri kontrolü alıyor, yaratıcı ama riskli bir çözümle meteorları atlatıyorsun. Yeni sinyal beliriyor: Kimlik sorgusu.",
        weights: {
          "DM": 3, "IN": 2, "AD": 4, "CM": 2, "ST": 4, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "D",
        text: "Hiçbir aksiyon alma; rota sabit kalıp panik yapmadan yoluna devam et, hasarı doğrudan kabullen.",
        forwardingLine: "Sarsıntı büyük ama şans senden yana. Telsizden gelen komut bu kez şansa yer bırakmıyor: Kimliğini doğrula.",
        weights: {
          "DM": 5, "IN": 0, "AD": 1, "CM": 0, "ST": 2, "TO": 5, "RL": 1, "RI": 5
        }
      }
    ]
  },
  {
    id: 7,
    text: "Telsizden zayıf bir sinyal geliyor:\n\"Kimliğini doğrula.\"\nFederasyon uydusu seni sorguluyor.\nNasıl yanıt verirsin?",
    forwardingLine: "Kimlik doğrulamasını halledip, ufukta görünen korsan gemilerine odaklanıyorsun.",
    options: [
      {
        id: "A",
        text: "Hemen tüm teknik kimlik verilerini gönderip kimliğimi kanıtlıyorum.",
        forwardingLine: "Otomasyon hızlı cevaplıyor, sistem seni tanıyor. İleride korsan gemileri belirmeye başlıyor.",
        weights: {
          "DM": 4, "IN": 4, "AD": 1, "CM": 1, "ST": 5, "TO": 4, "RL": 5, "RI": 1
        }
      },
      {
        id: "B",
        text: "Bu görevin evrenin dengesini koruduğunu anlatarak ikna edici bir hikâye başlatıyorum.",
        forwardingLine: "Duygusal bağ kuruyorsun, operatör etkilendi. Ama gecikme yaşandı. Korsanlar ekranına düşüyor.",
        weights: {
          "DM": 2, "IN": 4, "AD": 3, "CM": 5, "ST": 2, "TO": 3, "RL": 4, "RI": 1
        }
      },
      {
        id: "C",
        text: "Diplomatik üslupla konuşup, karşı tarafı ikna ederek kimliğimi onaylatmaya çalışıyorum.",
        forwardingLine: "\"Seni anlıyorum ama…\" sesleri duyuluyor. İletişim kuruldu, ama radarına korsanlar girdi bile.",
        weights: {
          "DM": 3, "IN": 2, "AD": 4, "CM": 4, "ST": 3, "TO": 1, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Hiçbir şey demeden sessizce ortamdan geçip kimlik kontrolünü atlatmaya çalışıyorum.",
        forwardingLine: "Kayıt dışı geçtin, sistem seni sorgulamadı ama ekranına kırmızı uyarı düştü: Tehdit tespit edildi.",
        weights: {
          "DM": 5, "IN": 0, "AD": 2, "CM": 0, "ST": 4, "TO": 5, "RL": 2, "RI": 5
        }
      }
    ]
  },
  {
    id: 8,
    text: "Bir anda radarlar sustu. Gemin sarsıldı.\n\"Yükü ver, yoksa seni vururuz!\" diyen korsanlar telsizden bağırıyor.\nNe yaparsın?",
    forwardingLine: "Korsan tehdidini geride bırakıp, yeşil ışıklı terminal ekranına doğru ilerlerken.",
    options: [
      {
        id: "A",
        text: "2.000 Zenix'i masaya koy, anında geçişi sağla.",
        forwardingLine: "Cüzdanına dokundu ama hayatını kurtardı. Terminal operatörünün ekranı seni karşılıyor.",
        weights: {
          "DM": 4, "IN": 3, "AD": 2, "CM": 2, "ST": 3, "TO": 5, "RL": 2, "RI": 2
        }
      },
      {
        id: "B",
        text: "Ekibini rehinmiş gibi gösterip korsanları yanılt, fırsatta kaç.",
        forwardingLine: "Oyunu oynadın, blöf işe yaradı ama ekibin güveni sarsıldı. Terminale ulaştığında gözler senin üzerinde.",
        weights: {
          "DM": 3, "IN": 4, "AD": 4, "CM": 3, "ST": 2, "TO": 3, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Federasyon rozeti tak, 'resmi görevlileriz' diye blöf yap ve uzaklaş.",
        forwardingLine: "Federasyon ismi geçince duraksadılar. Gerilimli ama geçişli bir an. Şimdi ekran soğuk: Terminal hazır.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 3, "ST": 3, "TO": 3, "RL": 3, "RI": 4
        }
      },
      {
        id: "D",
        text: "Topları ateşle, aktif çatışmaya gir ve korsanları sindir.",
        forwardingLine: "Hasar aldın ama kazandın. Terminal seni zayıf sinyallerle karşılıyor. Görev devam ediyor.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 0, "ST": 4, "TO": 2, "RL": 1, "RI": 5
        }
      }
    ]
  },
  {
    id: 9,
    text: "Varışa birkaç dakika kalmış. Terminal sisteminden bir mesaj geliyor:\n\"Teslimatın amacı nedir?\"\nİlk izlenimi sen belirleyeceksin.\nNasıl cevap verirsin?",
    forwardingLine: "Mesajını girdikten sonra, koridorda çınlayan gecikme alarmına yöneliyorsun.",
    options: [
      {
        id: "A",
        text: "Bu teslimat tamamen ekonomik fayda için; yatırımınıza maksimum getiriyi sağlamak istiyoruz.",
        forwardingLine: "Terminal kısa bir duraksamayla onay veriyor. \"Gecikme\" alarmı yanıp sönmeye başlıyor; kontrol odasına yöneliyorsun.",
        weights: {
          "DM": 3, "IN": 3, "AD": 2, "CM": 3, "ST": 3, "TO": 4, "RL": 5, "RI": 1
        }
      },
      {
        id: "B",
        text: "Amacımız, enerji çekirdeğiyle insanlığın yaşam kalitesini en üst düzeye çıkarmak.",
        forwardingLine: "Duygusal açıklaman terminalde yankı buluyor, sistem seni tanıyor. Ama zaman geçiyor: Alarm ışıkları kontrol odasında yanıyor.",
        weights: {
          "DM": 2, "IN": 2, "AD": 3, "CM": 5, "ST": 2, "TO": 3, "RL": 5, "RI": 1
        }
      },
      {
        id: "C",
        text: "Bu teslimat zorunlu ve yegâne seçenek; başka bir yolunuz yok.",
        forwardingLine: "Sert tavrın sisteme işliyor, ama acil durum protokolü devreye giriyor. Kontrol odasında kırmızı uyarılar beliriyor.",
        weights: {
          "DM": 5, "IN": 1, "AD": 1, "CM": 2, "ST": 5, "TO": 5, "RL": 2, "RI": 3
        }
      },
      {
        id: "D",
        text: "Detaya gerek duymuyoruz; teslimatı eksiksiz ve zamanında yapmakla meşgulüz.",
        forwardingLine: "Soğuk bir kabul, mekanik bir ilerleyiş. Ama sistem gecikmeyi algılıyor. Kontrol odasındaki alarmlar seni bekliyor.",
        weights: {
          "DM": 5, "IN": 0, "AD": 1, "CM": 1, "ST": 4, "TO": 5, "RL": 3, "RI": 2
        }
      }
    ]
  },
  {
    id: 10,
    text: "Terminalde sistem arızası oldu. Teslimat onayı ertelendi.\nZaman daralıyor. Senin teslimatı tamamlaman gerek.\nNe yaparsın?",
    forwardingLine: "Alarm sessizleşirken, kargo bölmesinden gelen ani sarsıntıyı hissediyorsun.",
    options: [
      {
        id: "A",
        text: "Acil yardım önerisi yaparak ekibe destek ve kaynak sağlayıp süreci hızlandır.",
        forwardingLine: "Ekibi organize ediyorsun, alarm yavaşça sönüyor. Ama sarsıntı hissi aniden başlıyor. Kargo bölümüne geçiyorsun.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 4, "ST": 2, "TO": 3, "RL": 5, "RI": 2
        }
      },
      {
        id: "B",
        text: "Zamanım kısıtlı, müdahaleye gerek yok; mevcut planı sekteye uğratmadan devam et.",
        forwardingLine: "Direkt müdahale işe yarıyor ama sistem seni tehdit olarak işaretliyor. Ani bir sarsıntıyla kargo bölgesine geçiyorsun.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 1, "ST": 3, "TO": 5, "RL": 2, "RI": 3
        }
      },
      {
        id: "C",
        text: "Sistemi derinlemesine incelemek için 10 dakika iste; sorunları bu sürede çözeceğim.",
        forwardingLine: "Teknik detaylar kontrol altına alınıyor. Alarm sönüyor, ama zaman kaybı sarsıntıya yol açıyor. Kargoya bakman gerek.",
        weights: {
          "DM": 2, "IN": 3, "AD": 3, "CM": 2, "ST": 5, "TO": 2, "RL": 3, "RI": 2
        }
      },
      {
        id: "D",
        text: "Terminal ekibini ikna edip acil öncelik tanıt; gecikmeyi bu şekilde aşacağız.",
        forwardingLine: "İkna edici konuşman öncelik kazandırıyor. Alarm sustu, ama kargo sistemindeki titreşim başlıyor. Kontrol için oradasın.",
        weights: {
          "DM": 3, "IN": 4, "AD": 3, "CM": 5, "ST": 3, "TO": 2, "RL": 4, "RI": 2
        }
      }
    ]
  },
  {
    id: 11,
    text: "Gemide ani bir sarsıntı oldu. Kargo bölümünden gelen sesler tehlikeli.\nEğer yük zarar görürse, teslimat başarısız olabilir.\nNasıl müdahale edersin?",
    forwardingLine: "Sarsıntıyı atlattıktan sonra, boş görünen teslimat alanına ulaşıyorsun.",
    options: [
      {
        id: "A",
        text: "Hemen manuel kontrole geçip kargoyu sıkı şekilde sabitliyorum.",
        forwardingLine: "Kas gücüyle müdahale ediyorsun. Stabilizasyon sağlanıyor. Terminale ilerliyorsun; bekleme ekranı açıldı bile.",
        weights: {
          "DM": 3, "IN": 1, "AD": 5, "CM": 0, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Kargo bölmesini kapatıp korumaya alıyorum; ekstra riski göze almıyorum.",
        forwardingLine: "Hızlı karar seni kurtardı, kargo korunmuş gibi. Terminal ekranında geri sayım başladı: 2 dakika.",
        weights: {
          "DM": 4, "IN": 0, "AD": 1, "CM": 0, "ST": 3, "TO": 3, "RL": 3, "RI": 1
        }
      },
      {
        id: "C",
        text: "Mühendisi çağırıp teknik müdahale ettiriyorum; uzaktan gerekli onarımı yaptır.",
        forwardingLine: "Teknik ekip dışarıdan müdahale ediyor. Hafif hasar var ama kontrol sağlandı. Bekleme terminaline geçiyorsun.",
        weights: {
          "DM": 2, "IN": 2, "AD": 3, "CM": 2, "ST": 3, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "D",
        text: "Rotama devam ediyorum; ek bir aksiyon almıyorum.",
        forwardingLine: "Risk aldın, kargo zedelendi mi bilinmez. Ama zaman kaybetmeden ilerliyorsun. Bekleme ekranı seni karşılıyor.",
        weights: {
          "DM": 5, "IN": 0, "AD": 1, "CM": 0, "ST": 2, "TO": 4, "RL": 1, "RI": 5
        }
      }
    ]
  },
  {
    id: 12,
    text: "Terminale vardın ama alan boş. Teslim alacak kimse yok.\nSistemde \"Bekleme süresi: 2 dk\" yazıyor.\nNasıl hareket edersin?",
    forwardingLine: "Beklerken aniden buharlanan kokpit ve çığlık atan motor alarmlarına odaklanıyorsun.",
    options: [
      {
        id: "A",
        text: "Burada kalıp kısa süre bekle, alıcının gelmesini gözle, teslimatı hazır tut.",
        forwardingLine: "Dakikalar geçiyor, ekran hareketleniyor. Motorlarındaki ses yükseliyor. Aşırı ısınma alarmı devrede. Kokpite geçiyorsun.",
        weights: {
          "DM": 3, "IN": 1, "AD": 2, "CM": 0, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Kilitli kapıyı zorla aç, içeri gir ve teslimatı bizzat gerçekleştir.",
        forwardingLine: "Kapıyı zorluyorsun, sistem seni tanıyor. Teslim tamam ama motorlar tepki veriyor. Kokpite geçiş şart.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 0, "ST": 3, "TO": 3, "RL": 1, "RI": 5
        }
      },
      {
        id: "C",
        text: "Üst yönetimi derhal arayıp net teslimat talimatı ve ek bilgi iste.",
        forwardingLine: "Bağlantı kuruldu, onay alındı. Tam o anda kokpit ekranında motor sıcaklığı uyarısı beliriyor. Harekete geçiyorsun.",
        weights: {
          "DM": 3, "IN": 3, "AD": 3, "CM": 3, "ST": 4, "TO": 2, "RL": 5, "RI": 2
        }
      },
      {
        id: "D",
        text: "Kargoyu olduğu yerde bırak ve hemen ayrıl, ek bir eylem yapmadan riski kabul et.",
        forwardingLine: "Tereddütsüzce terminale bırakıp ayrılıyorsun. Ama sistem seni tanıdı. Aşırı ısınma sensörü kokpiti kilitliyor.",
        weights: {
          "DM": 5, "IN": 0, "AD": 1, "CM": 0, "ST": 2, "TO": 2, "RL": 1, "RI": 4
        }
      }
    ]
  },
  {
    id: 13,
    text: "İnişe geçmeden önce motorlar uyarı veriyor.\nKaptan olarak karar senin.\nKontrollü iniş mi, agresif çözüm mü?",
    forwardingLine: "Acil durumu kontrol altına aldıktan sonra, telsizden gelen \"Dur, kargo incelemesi\" anonsuyla karşılaşıyorsun.",
    options: [
      {
        id: "A",
        text: "Tüm sistemleri yavaşlat, kontrolü koruyarak kontrollü inişi gerçekleştir.",
        forwardingLine: "Yavaşlama işe yarıyor, motorlar serinliyor. İletişim hattı açılıyor: Yeni bir çağrı alıyorsun.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 1, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Derhal acil iniş moduna geç; son ana kadar maksimum hızı koru.",
        forwardingLine: "Sert bir manevrayla sistem resetleniyor. Riskliydi ama çalıştı. İletişim kanalında yeni bir emir yankılanıyor.",
        weights: {
          "DM": 5, "IN": 0, "AD": 2, "CM": 0, "ST": 3, "TO": 4, "RL": 2, "RI": 4
        }
      },
      {
        id: "C",
        text: "Mühendise güvenip iniş planını ona bırak; teknik kararları devreye sok.",
        forwardingLine: "Kontrolü devrettin. Sistem stabil hale geldi. Ekranda yeni çağrı beliriyor: Kontrol gemisi seni bekliyor.",
        weights: {
          "DM": 2, "IN": 2, "AD": 4, "CM": 2, "ST": 3, "TO": 2, "RL": 4, "RI": 3
        }
      },
      {
        id: "D",
        text: "Sistemi tamamen kapat, serbest düşüşe geç; diğer tüm uyarıları görmezden gel.",
        forwardingLine: "Kaos ama işe yarıyor. İniş tamamlandı. Tam bu sırada telsizden gelen kontrol çağrısı seni buluyor.",
        weights: {
          "DM": 5, "IN": 0, "AD": 2, "CM": 0, "ST": 2, "TO": 2, "RL": 1, "RI": 5
        }
      }
    ]
  },
  {
    id: 14,
    text: "Telsizden yeni bir çağrı geliyor:\n\n\"Dur. Kargoyu incelememiz gerekiyor.\"\n\nİnişe saniyeler kala müdahale ediliyor.\n\nNe yaparsın?",
    forwardingLine: "\nKargo incelemesi geride kalınca, navigasyon çizgileri aniden kayboluyor.\n",
    options: [
      {
        id: "A",
        text: "Durumu bildir, tüm sistemleri hemen senkronize et ve kontrol gemisiyle koordinasyonu sağla.",
        forwardingLine: "Sistem seninle. Kontrol sağlandı. Ama eski navigasyon kaydın silinmiş. Şimdi koordinat arayışındasın.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 3, "ST": 4, "TO": 3, "RL": 5, "RI": 2
        }
      },
      {
        id: "B",
        text: "Güç aktarım simülasyonunu başlat; duraksamadan düz yolda ilerle.",
        forwardingLine: "Sinyal bozucu işe yaradı, kaçtın. Ancak navigasyon kaydın silindi. Ekran boş. Yön bulman gerek.",
        weights: {
          "DM": 4, "IN": 3, "AD": 2, "CM": 1, "ST": 3, "TO": 2, "RL": 1, "RI": 5
        }
      },
      {
        id: "C",
        text: "Federasyon kimliğini anında yolla, yetkini göstererek rotayı değiştirmeden devam et.",
        forwardingLine: "Kimlik tanındı, geçiş onaylandı. Ama veri kaybı var. Navigasyon ekranı beyaz bir boşluk gösteriyor.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 2, "ST": 3, "TO": 4, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Sadece mevcut konumu paylaş, mevcut navigasyonu silip hemen yeni rotaya geç.",
        forwardingLine: "Yerini verdin ama rota şifrelendi. Navigasyon sistemin koordinatsız kaldı. Yeni bir yön belirlemelisin.",
        weights: {
          "DM": 4, "IN": 1, "AD": 2, "CM": 1, "ST": 3, "TO": 2, "RL": 2, "RI": 4
        }
      }
    ]
  },
  {
    id: 15,
    text: "Ekran karardı. Koordinatlar silinmiş.\n\nVarış noktası görünmüyor.\n\nYeni rota nasıl belirlenir?",
    forwardingLine: "\nYeni rotayı belirlerken, veri ekranında \"Alıcı bilgisi: ?\" uyarısını fark ediyorsun.\n",
    options: [
      {
        id: "A",
        text: "Manuel koordinatları girip eski kayıtlardan güvenilir bir rota seçiyorum.",
        forwardingLine: "Hafızana güvenerek sistemi elle girdin. Rota oluştu. Son teslimat noktasına yaklaşıyorsun.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 1, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Yapay zekaya yeni bir rota oluşturması için derhal talimat gönderiyorum.",
        forwardingLine: "Yeni rota oluşturuldu ama yapay zeka uyarı veriyor: Alıcı bilgisi eksik. Terminal seni bekliyor.",
        weights: {
          "DM": 2, "IN": 1, "AD": 4, "CM": 0, "ST": 3, "TO": 3, "RL": 4, "RI": 3
        }
      },
      {
        id: "C",
        text: "Terminale ulaşıp orada doğrudan sinyal talebi yaparak güncel konumu öğreniyorum.",
        forwardingLine: "Terminal verisiyle sinyal alındı. Ama kim alacak? Son teslim ekranı soruyla açılıyor: Alıcı kim?",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 3, "ST": 4, "TO": 2, "RL": 5, "RI": 2
        }
      },
      {
        id: "D",
        text: "Haritayı tahminle çizip rotayı belirliyorum; risk alıp doğrudan devam ediyorum.",
        forwardingLine: "Kafanda bir yol çizdin, motoru ateşledin. Nihayet terminale ulaşıyorsun ama ekran hâlâ soruyor: Alıcı?",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 0, "ST": 3, "TO": 3, "RL": 2, "RI": 5
        }
      }
    ]
  },
  {
    id: 16,
    text: "Teslim noktasına ulaştın.\n\nAma sistemde sadece şu yazıyor:\n\"Alıcı: ?\"\n\nKime teslim edeceksin?",
    forwardingLine: "\nYük teslim edildi. Görev tamamlandı.\n",
    options: [
      {
        id: "A",
        text: "Kontrol sistemine anında bildir; gelen ilk yetkiliye kargoyu teslim et.",
        forwardingLine: "Teslimat tamamlandı. Ama kimlik belirsizliği seni düşündürüyor. Görev sona eriyor, ama akılda soru var.",
        weights: {
          "DM": 4, "IN": 2, "AD": 2, "CM": 2, "ST": 3, "TO": 4, "RL": 2, "RI": 4
        }
      },
      {
        id: "B",
        text: "Şirket temsilcisi gelene kadar bekle; yetki belgesini kontrol ettir.",
        forwardingLine: "Zaman geçiyor, sonunda doğru kişi beliriyor. Teslimat tamam. Görev kaydın sisteme yükleniyor.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 1, "ST": 5, "TO": 2, "RL": 5, "RI": 2
        }
      },
      {
        id: "C",
        text: "Teslimat kodunu gönderdim; kimin yanıt verdiğini onayla, sonra teslim et.",
        forwardingLine: "Kod yanıt buluyor, sistem onaylıyor. Fakat içeride kim var, bilinmez. Görev dosyan kapandı.",
        weights: {
          "DM": 4, "IN": 2, "AD": 3, "CM": 2, "ST": 4, "TO": 3, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Terminali hemen terk et; teslimatı iptal et.",
        forwardingLine: "Görevi iptal ettin. Sistem bunu not etti. Arkanda kalan kargoyla birlikte, sonsuz boşluğa doğru uzaklaşıyorsun.",
        weights: {
          "DM": 5, "IN": 0, "AD": 1, "CM": 0, "ST": 2, "TO": 2, "RL": 1, "RI": 5
        }
      }
    ]
  }
].map(q => ({
  ...q,
  text: q.text.replace(/\n/g, '\n\n'),
  forwardingLine: `\n${q.forwardingLine}\n`
}));

export const competencies = [
  { name: "DM", color: "#FF6B6B", fullName: "Decision Making" },
  { name: "IN", color: "#4ECDC4", fullName: "Initiative" },
  { name: "AD", color: "#45B7D1", fullName: "Adaptability" },
  { name: "CM", color: "#96CEB4", fullName: "Communication" },
  { name: "ST", color: "#FFD93D", fullName: "Strategic Thinking" },
  { name: "TO", color: "#6C5CE7", fullName: "Time Management" },
  { name: "RL", color: "#E17055", fullName: "Risk Leadership" },
  { name: "RI", color: "#00B894", fullName: "Risk Intelligence" }
]; 