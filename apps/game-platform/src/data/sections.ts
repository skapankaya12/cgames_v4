export interface SectionData {
  id: number;
  title: {
    en: string;
    tr: string;
  };
  onboarding: {
    title: {
      en: string;
      tr: string;
    };
    description: {
      en: string;
      tr: string;
    };
    keyPoints: {
      en: string[];
      tr: string[];
    };
    focus: {
      en: string[];
      tr: string[];
    };
  };
  endText: {
    title: {
      en: string;
      tr: string;
    };
    content: {
      en: string;
      tr: string;
    };
  };
  questionRange: {
    start: number;
    end: number;
  };
}

export const sections: SectionData[] = [
  {
    id: 1,
    title: {
      en: "Section 1",
      tr: "Bölüm 1"
    },
    onboarding: {
      title: {
        en: "Mission Briefing: Initial Contact",
        tr: "Görev Brifingi: İlk Temas"
      },
      description: {
        en: "The mission begins in a dim warehouse. Early pressures already confront you: payment, negotiation, fake documents, crowd control, patrol questioning. The mission has barely started, but the pressure is already on you. In a dim warehouse, you face decisions that will challenge you: will you pay to proceed, negotiate, use fake documents to take risks, or buy time to make a plan? There are crowds, tight corridors, checkpoints and patrol ships at the exit.",
        tr: "Görev henüz başlıyor ama baskı şimdiden üzerindesin. Loş bir depoda seni zorlayacak kararlarla karşılaşıyorsun: para ödeyerek mi ilerleyeceksin, pazarlık mı yapacaksın, risk alıp sahte belge mi kullanacaksın yoksa zamanı kazanıp plan mı kuracaksın? Çıkışta kalabalık, sıkışık koridorlar, kontrol noktaları ve devriye gemileri var."
      },
      keyPoints: {
        en: [
          "This section measures your initial reflexes. Is quick problem-solving a priority or strategic waiting?",
          "How quickly are you willing to consume your resources (money, energy, documents)?",
          "Is security your primary priority or is it to progress in the shortest time?"
        ],
        tr: [
          "Bu bölüm, senin ilk reflekslerini ölçer. Çabuk çözümcülük mü önceliklidir yoksa stratejik bekleme mi?",
          "Kaynaklarını (para, enerji, belge) ne kadar hızlı tüketmeye hazırsın?",
          "Güvenlik mi senin için birincil öncelik yoksa en kısa sürede ilerlemek mi?"
        ]
      },
      focus: {
        en: [
          "Speed vs controlled progress",
          "Resource spending vs resource conservation",
          "Rule compliance vs creating your own solution"
        ],
        tr: [
          "Hız vs kontrollü ilerleme",
          "Kaynak harcama vs kaynak koruma",
          "Kurallara uyum vs kendi çözümünü yaratma"
        ]
      }
    },
    endText: {
      title: {
        en: "Section 1 Complete",
        tr: "Bölüm 1 Tamamlandı"
      },
      content: {
        en: "You've overcome the initial pressure. Now the work is more about what kind of route you'll chart rather than \"staying in the game.\" In the next section, both instinct and system, both celestial threats and identity questions will confront you at the same time.",
        tr: "İlk baskıyı atlattın. Şimdi artık iş, \"oyunda kalmak\"tan çok nasıl bir rota çizeceğin ile ilgili olacak. Bir sonraki bölümde hem içgüdü hem sistem, hem göksel tehditler hem de kimlik sorguları aynı anda karşına çıkacak."
      }
    },
    questionRange: { start: 1, end: 4 }
  },
  {
    id: 2,
    title: {
      en: "Section 2",
      tr: "Bölüm 2"
    },
    onboarding: {
      title: {
        en: "Navigation Crisis",
        tr: "Navigasyon Krizi"
      },
      description: {
        en: "You're on your way now. Your navigation system is breaking down, meteor threat is knocking on your door, federation is doing identity checks and pirates are squeezing you. These scenes show how you deal with multiple crises at the same time. Here prioritization becomes very pronounced.",
        tr: "Artık yoldasın. Navigasyon sistemin bozuluyor, meteor tehdidi kapına dayanıyor, federasyon kimlik kontrolü yapıyor ve korsanlar seni sıkıştırıyor. Bu sahneler, aynı anda birçok kriz ile nasıl baş ettiğini gösterir. Burada önceliklendirme çok belirginleşir."
      },
      keyPoints: {
        en: [
          "Do you trust the system or your instincts?",
          "Do you use collective decision-making or individual initiative under time pressure?",
          "Do you choose diplomacy or use of force when faced with threat?"
        ],
        tr: [
          "Sisteme mi güvenirsin yoksa içgüdüne mi?",
          "Zaman baskısı altında toplu karar alma mı yoksa tek başına inisiyatif mi kullanırsın?",
          "Tehditle karşılaştığında diplomasi mi yoksa güç kullanımı mı seçersin?"
        ]
      },
      focus: {
        en: [
          "System vs instinct reliability",
          "Communication skills under stress",
          "Risk compromise decisions",
          "Time management strategies"
        ],
        tr: [
          "İçgüdüye mi, sisteme mi güvendiğini",
          "Stres altında iletişim becerini",
          "Risk karşısında ödünleşimini",
          "Zamanı nasıl yönettiğini gösterir"
        ]
      }
    },
    endText: {
      title: {
        en: "Section 2 Complete",
        tr: "Bölüm 2 Tamamlandı"
      },
      content: {
        en: "You've passed meteors, pirates and identity barriers. The terminal appeared. Now the issue is more operational consistency and cargo security. Critical decisions await you in the 3rd section.",
        tr: "Meteorları, korsanları ve kimlik bariyerini geçtin. Terminal göründü. Artık konu, daha operasyonel tutarlılık ve kargo güvenliği. 3. bölümde asıl kritik kararlar seni bekliyor."
      }
    },
    questionRange: { start: 5, end: 8 }
  },
  {
    id: 3,
    title: {
      en: "Section 3",
      tr: "Bölüm 3"
    },
    onboarding: {
      title: {
        en: "Terminal Operations",
        tr: "Terminal Operasyonları"
      },
      description: {
        en: "You're very close to delivery now, but uncertainty and system problems are blocking your way. You need to respond to messages from the terminal, system failures are delaying you, the cargo may be damaged by vibration and there is no one to receive it. This section reveals your operational priorities.",
        tr: "Artık teslimata çok yaklaştın, ama belirsizlik ve sistem sorunları önünü kesiyor. Terminalden gelen mesajlara cevap vermen gerekiyor, sistem arızaları seni geciktiriyor, kargo sarsıntıyla zarar görebilir ve teslim alacak kimse ortada yok. Bu bölüm, senin operasyonel önceliklerini gösterir."
      },
      keyPoints: {
        en: [
          "Do you prioritize following procedures and rules, or do you produce practical solutions?",
          "Under time pressure, how do you make decisions?",
          "Is protecting cargo more valuable to you, or is it saving time?"
        ],
        tr: [
          "Prosedür ve kuralları ne kadar öncelik veriyorsun?",
          "Zaman baskısı altında nasıl karar alıyorsun?",
          "Kargoyu korumak mı, teslimatı hızlandırmak mı senin için daha önemli?"
        ]
      },
      focus: {
        en: [
          "\"Trust the system and slow but safe solution\" or \"fast but risky decision\"?",
          "\"Communicate with senior management\" or \"act entirely on your own decisions\"?",
          "How do you define the meaning of delivery? Economic benefit, human benefit, or just fulfilling the procedure?"
        ],
        tr: [
          "\"Sisteme güvenip yavaş ama güvenli çözüm\" mü? \"Hızlı ama riskli karar\" mı?",
          "\"Üst yönetimle iletişim kurmak\" mı, yoksa \"tamamen kendi kararlarınla hareket etmek\" mi?",
          "Teslimatın anlamını nasıl tanımlıyorsun? Ekonomik fayda mı, insanlık yararı mı, yoksa sadece prosedürü yerine getirmek mi?"
        ]
      }
    },
    endText: {
      title: {
        en: "Section 3 Complete",
        tr: "Bölüm 3 Tamamlandı"
      },
      content: {
        en: "You are very close to the end now. Engines are giving warnings, landing protocols are conflicting, cargo inspection call is coming. In the last section, the pressure will increase even more and you will now show your ultimate priority.",
        tr: "Artık sona çok yakınsın. Motorlar uyarı veriyor, iniş protokolleri çakışıyor, kargo incelemesi çağrısı geliyor. Son bölümde baskı daha da artacak ve artık nihai önceliğini göstereceksin."
      }
    },
    questionRange: { start: 9, end: 12 }
  },
  {
    id: 4,
    title: {
      en: "Section 4",
      tr: "Bölüm 4"
    },
    onboarding: {
      title: {
        en: "Final Approach",
        tr: "Final Yaklaşım"
      },
      description: {
        en: "Final decisions: landing method, response to cargo inspection, lost coordinates, who to deliver to. This section reveals your determination, finding your way in uncertainty and your accountable delivery preference.",
        tr: "Son kararlar: iniş şekli, kargo incelemesine yanıt, kaybolan koordinatlar, kime teslim edeceğin. Bu bölüm senin kararlılığını, belirsizlikte yol bulmanı ve hesap verilebilir teslim tercihini ortaya çıkarır."
      },
      keyPoints: {
        en: [
          "Are you delivering in the fastest way?",
          "In the safest and documented way?",
          "Or do you choose a speed-risk combination where it's unclear who you're delivering to?"
        ],
        tr: [
          "En hızlı şekilde mi teslim ediyorsun?",
          "En güvenli ve belgeli şekilde mi?",
          "Yoksa kime teslim ettiğinin bile belirsiz olduğu bir hız–risk kombinasyonu mu seçiyorsun?"
        ]
      },
      focus: {
        en: [
          "Controlled but slow and safe landing?",
          "Fast but risky solution?",
          "Taking assurance with documents and identity verification?",
          "Or \"reaching the result\" without even knowing who you're delivering to?"
        ],
        tr: [
          "Kontrolü bırakmadan güvenli ama yavaş iniş mi?",
          "Hızlı ama riskli bir çözüm mü?",
          "Belgeler ve kimlik doğrulamasıyla güvence almak mı?",
          "Yoksa kime teslim ettiğini bile bilmeden \"sonuca ulaşmak\" mı?"
        ]
      }
    },
    endText: {
      title: {
        en: "Mission Complete",
        tr: "Görev Tamamlandı"
      },
      content: {
        en: "Delivery completed. Your choices have been processed and your decision-making priorities have been revealed. Your report will clearly show which features you highlighted and which features you put in the background. Remember: The purpose of this test is not to find the \"perfect combination\"; it is to show what priorities you act according to.",
        tr: "Teslimat tamamlandı. Seçimlerin işlendi ve senin karar verme önceliklerin ortaya çıkarıldı. Raporunda hangi özellikleri öne çıkardığın, hangi özellikleri geri plana attığın net bir şekilde gözükecek. Unutma: Bu testte amaç \"mükemmel kombinasyon\"u bulmak değil; senin hangi önceliklere göre hareket ettiğini göstermek."
      }
    },
    questionRange: { start: 13, end: 16 }
  }
];

export const getSectionByQuestionId = (questionId: number): SectionData | null => {
  return sections.find(section => 
    questionId >= section.questionRange.start && questionId <= section.questionRange.end
  ) || null;
};

export const getSectionById = (sectionId: number): SectionData | null => {
  return sections.find(section => section.id === sectionId) || null;
};
