interface Option {
  id: string;
  text: string;
  weights: CompetencyWeights;
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
        weights: {
          "DM": 5, "IN": 0, "AD": 1, "CM": 1, "ST": 2, "TO": 5, "RL": 4, "RI": 1
        }
      },
      {
        id: "B",
        text: "Teslimatı elden yapar yapmaz 8.000 Zenix'i derhal gönderirim; kargoyu hemen elden al.",
        weights: {
          "DM": 3, "IN": 5, "AD": 3, "CM": 2, "ST": 4, "TO": 4, "RL": 3, "RI": 2
        }
      },
      {
        id: "C",
        text: "Sahte onay belgesi çıkarıp 'Kargo ücretsiz gönderiliyor' deyip belgeyi göstererek muhatabı ikna et.",
        weights: {
          "DM": 4, "IN": 3, "AD": 3, "CM": 1, "ST": 3, "TO": 2, "RL": 1, "RI": 5
        }
      },
      {
        id: "D",
        text: "Bana bir saat süre ver; alternatif bir çözüm bulup geri dönüp kargoyu teslim edeceğim.",
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
        weights: {
          "DM": 4, "IN": 2, "AD": 1, "CM": 1, "ST": 3, "TO": 5, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Kaçakçının gizli tüneline gir, kalabalığın altından ilerle.",
        weights: {
          "DM": 3, "IN": 4, "AD": 5, "CM": 1, "ST": 2, "TO": 2, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Kalabalığın dağılmasını bekle; gece çıkışını kullan.",
        weights: {
          "DM": 2, "IN": 1, "AD": 2, "CM": 2, "ST": 4, "TO": 1, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Motoru hızlıca yeniden ayarla, sistem çalışınca çıkış yap.",
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
        weights: {
          "DM": 5, "IN": 2, "AD": 1, "CM": 1, "ST": 3, "TO": 4, "RL": 1, "RI": 5
        }
      },
      {
        id: "B",
        text: "Gelin bu işten eşit kazanalım: %50 kârı paylaşalım\" diyerek ortaklık teklifi sunuyorum.",
        weights: {
          "DM": 3, "IN": 5, "AD": 3, "CM": 3, "ST": 4, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "C",
        text: "\"Hemen yanıt veremem, zamana ihtiyacım var\" diyerek duraklatıp vakit kazanmaya çalışıyorum.",
        weights: {
          "DM": 3, "IN": 3, "AD": 3, "CM": 2, "ST": 3, "TO": 2, "RL": 1, "RI": 3
        }
      },
      {
        id: "D",
        text: "Bu teklifi kesinlikle reddedip, misyonu aksatmadan doğrudan hedefime devam ediyorum.",
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
        weights: {
          "DM": 3, "IN": 2, "AD": 1, "CM": 2, "ST": 4, "TO": 4, "RL": 4, "RI": 3
        }
      },
      {
        id: "B",
        text: "Komutanı yemeğe davet et, gönlünü alarak iznini sağla.",
        weights: {
          "DM": 2, "IN": 5, "AD": 3, "CM": 3, "ST": 3, "TO": 1, "RL": 3, "RI": 2
        }
      },
      {
        id: "C",
        text: "Kargoyu gizlice sakla, aramaya izin ver; sonra rahatça ilerle.",
        weights: {
          "DM": 4, "IN": 2, "AD": 2, "CM": 1, "ST": 3, "TO": 2, "RL": 2, "RI": 5
        }
      },
      {
        id: "D",
        text: "Motorları çalıştır, fırsat doğar doğmaz doğrudan kaç.",
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
        weights: {
          "DM": 4, "IN": 2, "AD": 2, "CM": 1, "ST": 5, "TO": 4, "RL": 5, "RI": 1
        }
      },
      {
        id: "B",
        text: "Haritayı bir kenara bırak, içgüdüyü dinle ve kestirme rotaya doğru sür.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 0, "ST": 3, "TO": 4, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Hemen ekibi topla, çoğunluğun kararına göre rotayı belirle.",
        weights: {
          "DM": 2, "IN": 2, "AD": 3, "CM": 4, "ST": 3, "TO": 2, "RL": 4, "RI": 2
        }
      },
      {
        id: "D",
        text: "Bir saat boyunca dur, gözlemler yap; sonra en sağlıklı rotayı seç.",
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
        weights: {
          "DM": 4, "IN": 0, "AD": 2, "CM": 0, "ST": 2, "TO": 4, "RL": 3, "RI": 5
        }
      },
      {
        id: "B",
        text: "Kalkan jeneratörlerini maksimuma çek, motoru hızla ısıtarak savunmayı ve manevrayı güçlendir.",
        weights: {
          "DM": 3, "IN": 1, "AD": 2, "CM": 0, "ST": 3, "TO": 3, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Hemen mühendisi çağır, sıra dışı bir savunma modülü tasarlayıp uygulayın; meteorun yönünü saptırın.",
        weights: {
          "DM": 3, "IN": 2, "AD": 4, "CM": 2, "ST": 4, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "D",
        text: "Hiçbir aksiyon alma; rota sabit kalıp panik yapmadan yoluna devam et, hasarı doğrudan kabullen.",
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
        weights: {
          "DM": 4, "IN": 4, "AD": 1, "CM": 1, "ST": 5, "TO": 4, "RL": 5, "RI": 1
        }
      },
      {
        id: "B",
        text: "Bu görevin evrenin dengesini koruduğunu anlatarak ikna edici bir hikâye başlatıyorum.",
        weights: {
          "DM": 2, "IN": 4, "AD": 3, "CM": 5, "ST": 2, "TO": 3, "RL": 4, "RI": 1
        }
      },
      {
        id: "C",
        text: "Diplomatik üslupla konuşup, karşı tarafı ikna ederek kimliğimi onaylatmaya çalışıyorum.",
        weights: {
          "DM": 3, "IN": 2, "AD": 4, "CM": 4, "ST": 3, "TO": 1, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Hiçbir şey demeden sessizce ortamdan geçip kimlik kontrolünü atlatmaya çalışıyorum.",
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
        weights: {
          "DM": 4, "IN": 3, "AD": 2, "CM": 2, "ST": 3, "TO": 5, "RL": 2, "RI": 2
        }
      },
      {
        id: "B",
        text: "Ekibini rehinmiş gibi gösterip korsanları yanılt, fırsatta kaç.",
        weights: {
          "DM": 3, "IN": 4, "AD": 4, "CM": 3, "ST": 2, "TO": 3, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Federasyon rozeti tak, 'resmi görevlileriz' diye blöf yap ve uzaklaş.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 3, "ST": 3, "TO": 3, "RL": 3, "RI": 4
        }
      },
      {
        id: "D",
        text: "Topları ateşle, aktif çatışmaya gir ve korsanları sindir.",
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
        weights: {
          "DM": 3, "IN": 3, "AD": 2, "CM": 3, "ST": 3, "TO": 4, "RL": 5, "RI": 1
        }
      },
      {
        id: "B",
        text: "Amacımız, enerji çekirdeğiyle insanlığın yaşam kalitesini en üst düzeye çıkarmak.",
        weights: {
          "DM": 2, "IN": 2, "AD": 3, "CM": 5, "ST": 2, "TO": 3, "RL": 5, "RI": 1
        }
      },
      {
        id: "C",
        text: "Bu teslimat zorunlu ve yegâne seçenek; başka bir yolunuz yok.",
        weights: {
          "DM": 5, "IN": 1, "AD": 1, "CM": 2, "ST": 5, "TO": 5, "RL": 2, "RI": 3
        }
      },
      {
        id: "D",
        text: "Detaya gerek duymuyoruz; teslimatı eksiksiz ve zamanında yapmakla meşgulüz.",
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
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 4, "ST": 2, "TO": 3, "RL": 5, "RI": 2
        }
      },
      {
        id: "B",
        text: "Zamanım kısıtlı, müdahaleye gerek yok; mevcut planı sekteye uğratmadan devam et.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 1, "ST": 3, "TO": 5, "RL": 2, "RI": 3
        }
      },
      {
        id: "C",
        text: "Sistemi derinlemesine incelemek için 10 dakika iste; sorunları bu sürede çözeceğim.",
        weights: {
          "DM": 2, "IN": 3, "AD": 3, "CM": 2, "ST": 5, "TO": 2, "RL": 3, "RI": 2
        }
      },
      {
        id: "D",
        text: "Terminal ekibini ikna edip acil öncelik tanıt; gecikmeyi bu şekilde aşacağız.",
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
        weights: {
          "DM": 3, "IN": 1, "AD": 5, "CM": 0, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Kargo bölmesini kapatıp korumaya alıyorum; ekstra riski göze almıyorum.",
        weights: {
          "DM": 4, "IN": 0, "AD": 1, "CM": 0, "ST": 3, "TO": 3, "RL": 3, "RI": 1
        }
      },
      {
        id: "C",
        text: "Mühendisi çağırıp teknik müdahale ettiriyorum; uzaktan gerekli onarımı yaptır.",
        weights: {
          "DM": 2, "IN": 2, "AD": 3, "CM": 2, "ST": 3, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "D",
        text: "Rotama devam ediyorum; ek bir aksiyon almıyorum.",
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
        weights: {
          "DM": 3, "IN": 1, "AD": 2, "CM": 0, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Kilitli kapıyı zorla aç, içeri gir ve teslimatı bizzat gerçekleştir.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 0, "ST": 3, "TO": 3, "RL": 1, "RI": 5
        }
      },
      {
        id: "C",
        text: "Üst yönetimi derhal arayıp net teslimat talimatı ve ek bilgi iste.",
        weights: {
          "DM": 3, "IN": 3, "AD": 3, "CM": 3, "ST": 4, "TO": 2, "RL": 5, "RI": 2
        }
      },
      {
        id: "D",
        text: "Kargoyu olduğu yerde bırak ve hemen ayrıl, ek bir eylem yapmadan riski kabul et.",
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
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 1, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Derhal acil iniş moduna geç; son ana kadar maksimum hızı koru.",
        weights: {
          "DM": 5, "IN": 0, "AD": 2, "CM": 0, "ST": 3, "TO": 4, "RL": 2, "RI": 4
        }
      },
      {
        id: "C",
        text: "Mühendise güvenip iniş planını ona bırak; teknik kararları devreye sok.",
        weights: {
          "DM": 2, "IN": 2, "AD": 4, "CM": 2, "ST": 3, "TO": 2, "RL": 4, "RI": 3
        }
      },
      {
        id: "D",
        text: "Sistemi tamamen kapat, serbest düşüşe geç; diğer tüm uyarıları görmezden gel.",
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
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 3, "ST": 4, "TO": 3, "RL": 5, "RI": 2
        }
      },
      {
        id: "B",
        text: "Güç aktarım simülasyonunu başlat; duraksamadan düz yolda ilerle.",
        weights: {
          "DM": 4, "IN": 3, "AD": 2, "CM": 1, "ST": 3, "TO": 2, "RL": 1, "RI": 5
        }
      },
      {
        id: "C",
        text: "Federasyon kimliğini anında yolla, yetkini göstererek rotayı değiştirmeden devam et.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 2, "ST": 3, "TO": 4, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Sadece mevcut konumu paylaş, mevcut navigasyonu silip hemen yeni rotaya geç.",
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
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 1, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Yapay zekaya yeni bir rota oluşturması için derhal talimat gönderiyorum.",
        weights: {
          "DM": 2, "IN": 1, "AD": 4, "CM": 0, "ST": 3, "TO": 3, "RL": 4, "RI": 3
        }
      },
      {
        id: "C",
        text: "Terminale ulaşıp orada doğrudan sinyal talebi yaparak güncel konumu öğreniyorum.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 3, "ST": 4, "TO": 2, "RL": 5, "RI": 2
        }
      },
      {
        id: "D",
        text: "Haritayı tahminle çizip rotayı belirliyorum; risk alıp doğrudan devam ediyorum.",
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
        weights: {
          "DM": 4, "IN": 2, "AD": 2, "CM": 2, "ST": 3, "TO": 4, "RL": 2, "RI": 4
        }
      },
      {
        id: "B",
        text: "Şirket temsilcisi gelene kadar bekle; yetki belgesini kontrol ettir.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 1, "ST": 5, "TO": 2, "RL": 5, "RI": 2
        }
      },
      {
        id: "C",
        text: "Teslimat kodunu gönderdim; kimin yanıt verdiğini onayla, sonra teslim et.",
        weights: {
          "DM": 4, "IN": 2, "AD": 3, "CM": 2, "ST": 4, "TO": 3, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Terminali hemen terk et; teslimatı iptal ederek riskten uzaklaş.",
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