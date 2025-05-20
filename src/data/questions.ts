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
        text: "Parayı hemen öde.",
        weights: {
          "DM": 5, "IN": 0, "AD": 1, "CM": 1, "ST": 2, "TO": 5, "RL": 4, "RI": 1
        }
      },
      {
        id: "B",
        text: "\"Teslim sonrası ödeyeyim\" diye teklif yap.",
        weights: {
          "DM": 3, "IN": 5, "AD": 3, "CM": 2, "ST": 4, "TO": 4, "RL": 3, "RI": 2
        }
      },
      {
        id: "C",
        text: "Sahte onay belgesi göster.",
        weights: {
          "DM": 4, "IN": 3, "AD": 3, "CM": 1, "ST": 3, "TO": 2, "RL": 1, "RI": 5
        }
      },
      {
        id: "D",
        text: "\"1 saat ver, başka bir çözüm bakacağım.\"",
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
        text: "Özel geçiş için para öde.",
        weights: {
          "DM": 4, "IN": 2, "AD": 1, "CM": 1, "ST": 3, "TO": 5, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Kaçakçının tünelini kullan.",
        weights: {
          "DM": 3, "IN": 4, "AD": 5, "CM": 1, "ST": 2, "TO": 2, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Gece çıkışı bekle.",
        weights: {
          "DM": 2, "IN": 1, "AD": 2, "CM": 2, "ST": 4, "TO": 1, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Motor sistemini ayarla, sonra çık.",
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
        text: "Teklifi kabul et, yükü onlara teslim et.",
        weights: {
          "DM": 5, "IN": 2, "AD": 1, "CM": 1, "ST": 3, "TO": 4, "RL": 1, "RI": 5
        }
      },
      {
        id: "B",
        text: "Ortaklık öner, %50 kâr paylaşımı teklif et.",
        weights: {
          "DM": 3, "IN": 5, "AD": 3, "CM": 3, "ST": 4, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "C",
        text: "\"Zamana ihtiyacım var\" diyerek oyalamaya çalış.",
        weights: {
          "DM": 3, "IN": 3, "AD": 3, "CM": 2, "ST": 3, "TO": 2, "RL": 1, "RI": 3
        }
      },
      {
        id: "D",
        text: "Teklifi reddet, göreve devam et.",
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
        text: "Evrak + 500 Zenix rüşvet ver.",
        weights: {
          "DM": 3, "IN": 2, "AD": 1, "CM": 2, "ST": 4, "TO": 4, "RL": 4, "RI": 3
        }
      },
      {
        id: "B",
        text: "Komutanı çaya davet et, yumuşat.",
        weights: {
          "DM": 2, "IN": 5, "AD": 3, "CM": 3, "ST": 3, "TO": 1, "RL": 3, "RI": 2
        }
      },
      {
        id: "C",
        text: "Kargoyu sakla, aramasına izin ver.",
        weights: {
          "DM": 4, "IN": 2, "AD": 2, "CM": 1, "ST": 3, "TO": 2, "RL": 2, "RI": 5
        }
      },
      {
        id: "D",
        text: "Motorları aç, doğrudan kaç.",
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
        text: "Navigasyon sistemine güven.",
        weights: {
          "DM": 4, "IN": 2, "AD": 2, "CM": 1, "ST": 5, "TO": 4, "RL": 5, "RI": 1
        }
      },
      {
        id: "B",
        text: "Kestirme rotayı dene, içgüdüyle git.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 0, "ST": 3, "TO": 4, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Ekibe sor, çoğunluğa uy.",
        weights: {
          "DM": 2, "IN": 2, "AD": 3, "CM": 4, "ST": 3, "TO": 2, "RL": 4, "RI": 2
        }
      },
      {
        id: "D",
        text: "1 saat dur, gözlem yap ve sonra karar ver.",
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
        text: "Anteni kes, gövdeyi koru.",
        weights: {
          "DM": 4, "IN": 0, "AD": 2, "CM": 0, "ST": 2, "TO": 4, "RL": 3, "RI": 5
        }
      },
      {
        id: "B",
        text: "Kalkanlara güç ver, motor ısınsın.",
        weights: {
          "DM": 3, "IN": 1, "AD": 2, "CM": 0, "ST": 3, "TO": 3, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Mühendise bırak, yaratıcı çözüm uygulasın.",
        weights: {
          "DM": 3, "IN": 2, "AD": 4, "CM": 2, "ST": 4, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "D",
        text: "Hiçbir şey yapma, devam et.",
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
        text: "Hemen teknik bilgileri gönder.",
        weights: {
          "DM": 4, "IN": 4, "AD": 1, "CM": 1, "ST": 5, "TO": 4, "RL": 5, "RI": 1
        }
      },
      {
        id: "B",
        text: "Görevin önemini hikâyeleştir.",
        weights: {
          "DM": 2, "IN": 4, "AD": 3, "CM": 5, "ST": 2, "TO": 3, "RL": 4, "RI": 1
        }
      },
      {
        id: "C",
        text: "Diplomatik konuş, ikna etmeye çalış.",
        weights: {
          "DM": 3, "IN": 2, "AD": 4, "CM": 4, "ST": 3, "TO": 1, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Sessiz kal, hızla geç.",
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
        text: "2.000 Zenix öde, geç.",
        weights: {
          "DM": 4, "IN": 3, "AD": 2, "CM": 2, "ST": 3, "TO": 5, "RL": 2, "RI": 2
        }
      },
      {
        id: "B",
        text: "Ekibini sahte rehin olarak sun.",
        weights: {
          "DM": 3, "IN": 4, "AD": 4, "CM": 3, "ST": 2, "TO": 3, "RL": 2, "RI": 5
        }
      },
      {
        id: "C",
        text: "Federasyon rozetini göster, blöf yap.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 3, "ST": 3, "TO": 3, "RL": 3, "RI": 4
        }
      },
      {
        id: "D",
        text: "Topları ateşle, çatışmaya gir.",
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
        text: "Ekonomik faydayı vurgula.",
        weights: {
          "DM": 3, "IN": 3, "AD": 2, "CM": 3, "ST": 3, "TO": 4, "RL": 5, "RI": 1
        }
      },
      {
        id: "B",
        text: "Enerjinin insanlara katkısını anlat.",
        weights: {
          "DM": 2, "IN": 2, "AD": 3, "CM": 5, "ST": 2, "TO": 3, "RL": 5, "RI": 1
        }
      },
      {
        id: "C",
        text: "\"Bu teslimat gerekli, başka seçeneğiniz yok.\"",
        weights: {
          "DM": 5, "IN": 1, "AD": 1, "CM": 2, "ST": 5, "TO": 5, "RL": 2, "RI": 3
        }
      },
      {
        id: "D",
        text: "\"Detaya gerek yok, teslim edeceğim.\"",
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
        text: "Yardım teklif et.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 4, "ST": 2, "TO": 3, "RL": 5, "RI": 2
        }
      },
      {
        id: "B",
        text: "\"Zamanım yok, müdahale etmeyin\" de.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 1, "ST": 3, "TO": 5, "RL": 2, "RI": 3
        }
      },
      {
        id: "C",
        text: "Sistemi analiz etmek için 10 dakika iste.",
        weights: {
          "DM": 2, "IN": 3, "AD": 3, "CM": 2, "ST": 5, "TO": 2, "RL": 3, "RI": 2
        }
      },
      {
        id: "D",
        text: "Terminal ekibini ikna et, öncelik al.",
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
        text: "Manuel kontrolle sabitle.",
        weights: {
          "DM": 3, "IN": 1, "AD": 5, "CM": 0, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Kargo bölmesini kapat, risk alma.",
        weights: {
          "DM": 4, "IN": 0, "AD": 1, "CM": 0, "ST": 3, "TO": 3, "RL": 3, "RI": 1
        }
      },
      {
        id: "C",
        text: "Mühendise bırak, dışarıdan müdahale etsin.",
        weights: {
          "DM": 2, "IN": 2, "AD": 3, "CM": 2, "ST": 3, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "D",
        text: "\"Önemli değil\" diyerek devam et.",
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
        text: "Bekle, biri gelir.",
        weights: {
          "DM": 3, "IN": 1, "AD": 2, "CM": 0, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Girişi zorla, teslimatı kendi yap.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 0, "ST": 3, "TO": 3, "RL": 1, "RI": 5
        }
      },
      {
        id: "C",
        text: "Üst yönetime ulaş, bilgi iste.",
        weights: {
          "DM": 3, "IN": 3, "AD": 3, "CM": 3, "ST": 4, "TO": 2, "RL": 5, "RI": 2
        }
      },
      {
        id: "D",
        text: "Kargoyu bırak, ayrıl.",
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
        text: "Tüm sistemleri yavaşlat, kontrollü iniş yap.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 1, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Acil iniş moduna geç.",
        weights: {
          "DM": 5, "IN": 0, "AD": 2, "CM": 0, "ST": 3, "TO": 4, "RL": 2, "RI": 4
        }
      },
      {
        id: "C",
        text: "Mühendisin planına güven, yönlendirmeyi ona bırak.",
        weights: {
          "DM": 2, "IN": 2, "AD": 4, "CM": 2, "ST": 3, "TO": 2, "RL": 4, "RI": 3
        }
      },
      {
        id: "D",
        text: "Sistemi kapat, serbest düşüşe geç.",
        weights: {
          "DM": 5, "IN": 0, "AD": 2, "CM": 0, "ST": 2, "TO": 2, "RL": 1, "RI": 5
        }
      }
    ]
  },
  {
    id: 14,
    text: "Telsizden yeni bir çağrı geliyor:\n\"Dur. Kargoyu incelememiz gerekiyor.\"\nİnişe saniyeler kala müdahale ediliyor.\nNe yaparsın?",
    forwardingLine: "Kargo incelemesi geride kalınca, navigasyon çizgileri aniden kayboluyor.",
    options: [
      {
        id: "A",
        text: "Dur, tüm sistemleri hazırla ve işbirliği yap.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 3, "ST": 4, "TO": 3, "RL": 5, "RI": 2
        }
      },
      {
        id: "B",
        text: "Güç aktarımı simülasyonu başlat, durmadan ilerle.",
        weights: {
          "DM": 4, "IN": 3, "AD": 2, "CM": 1, "ST": 3, "TO": 2, "RL": 1, "RI": 5
        }
      },
      {
        id: "C",
        text: "Federasyon kimliğini gönder ve devam et.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 2, "ST": 3, "TO": 4, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Sadece konumu paylaş ve rotayı değiştir.",
        weights: {
          "DM": 4, "IN": 1, "AD": 2, "CM": 1, "ST": 3, "TO": 2, "RL": 2, "RI": 4
        }
      }
    ]
  },
  {
    id: 15,
    text: "Ekran karardı. Koordinatlar silinmiş.\nVarış noktası görünmüyor.\nYeni rota nasıl belirlenir?",
    forwardingLine: "Yeni rotayı belirlerken, veri ekranında \"Alıcı bilgisi: ?\" uyarısını fark ediyorsun.",
    options: [
      {
        id: "A",
        text: "Manuel koordinat gir, eski kayıtlara güven.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 1, "ST": 5, "TO": 3, "RL": 4, "RI": 2
        }
      },
      {
        id: "B",
        text: "Yapay zekadan yeni rota iste.",
        weights: {
          "DM": 2, "IN": 1, "AD": 4, "CM": 0, "ST": 3, "TO": 3, "RL": 4, "RI": 3
        }
      },
      {
        id: "C",
        text: "Terminale ulaş, oradan sinyal iste.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 3, "ST": 4, "TO": 2, "RL": 5, "RI": 2
        }
      },
      {
        id: "D",
        text: "Tahmini rota çiz, risk al ve devam et.",
        weights: {
          "DM": 5, "IN": 1, "AD": 2, "CM": 0, "ST": 3, "TO": 3, "RL": 2, "RI": 5
        }
      }
    ]
  },
  {
    id: 16,
    text: "Teslim noktasına ulaştın.\nAma sistemde sadece şu yazıyor:\n\"Alıcı: ?\"\nKime teslim edeceksin?",
    forwardingLine: "Yük teslim edildi. Görev tamamlandı.",
    options: [
      {
        id: "A",
        text: "Sisteme bildir, gelen ilk kişiye teslim et.",
        weights: {
          "DM": 4, "IN": 2, "AD": 2, "CM": 2, "ST": 3, "TO": 4, "RL": 2, "RI": 4
        }
      },
      {
        id: "B",
        text: "Şirketin temsilcisi gelene kadar bekle.",
        weights: {
          "DM": 3, "IN": 2, "AD": 3, "CM": 1, "ST": 5, "TO": 2, "RL": 5, "RI": 2
        }
      },
      {
        id: "C",
        text: "Teslimat kodunu gönder, kim yanıt verirse ona teslim et.",
        weights: {
          "DM": 4, "IN": 2, "AD": 3, "CM": 2, "ST": 4, "TO": 3, "RL": 3, "RI": 3
        }
      },
      {
        id: "D",
        text: "Terminali terk et, teslimatı iptal et.",
        weights: {
          "DM": 5, "IN": 0, "AD": 1, "CM": 0, "ST": 2, "TO": 2, "RL": 1, "RI": 5
        }
      }
    ]
  }
];

export const competencies = [
  { name: "DM", color: "#FF6B6B", fullName: "Decision Making" },
  { name: "IN", color: "#4ECDC4", fullName: "Initiative" },
  { name: "AD", color: "#45B7D1", fullName: "Adaptability" },
  { name: "CM", color: "#96CEB4", fullName: "Communication" },
  { name: "ST", color: "#FFD93D", fullName: "Strategic Thinking" },
  { name: "TO", color: "#6C5CE7", fullName: "Team Orientation" },
  { name: "RL", color: "#E17055", fullName: "Risk Leadership" },
  { name: "RI", color: "#00B894", fullName: "Risk Intelligence" }
]; 