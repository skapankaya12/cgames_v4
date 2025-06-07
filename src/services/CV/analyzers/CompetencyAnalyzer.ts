export class CompetencyAnalyzer {
  analyze(cvText: string): { [key: string]: { score: number; evidence: string[] } } {
    const competencies: { [key: string]: { keywords: string[]; score: number; evidence: string[] } } = {
      'DM': { // Karar Verme
        keywords: ['karar', 'decision', 'analiz', 'analysis', 'strateji', 'strategy'],
        score: 0,
        evidence: []
      },
      'IN': { // İnisiyatif
        keywords: ['inisiyatif', 'initiative', 'proaktif', 'proactive', 'girişim', 'leadership'],
        score: 0,
        evidence: []
      },
      'AD': { // Adaptasyon
        keywords: ['adaptasyon', 'adaptation', 'değişim', 'change', 'esneklik', 'flexibility'],
        score: 0,
        evidence: []
      },
      'CM': { // İletişim
        keywords: ['iletişim', 'communication', 'sunum', 'presentation', 'müzakere', 'negotiation'],
        score: 0,
        evidence: []
      },
      'ST': { // Stratejik Düşünce
        keywords: ['strateji', 'strategy', 'planlama', 'planning', 'vizyon', 'vision'],
        score: 0,
        evidence: []
      },
      'TO': { // Takım Çalışması
        keywords: ['takım', 'team', 'işbirliği', 'collaboration', 'koordinasyon', 'coordination'],
        score: 0,
        evidence: []
      }
    };

    const lowerCvText = cvText.toLowerCase();
    const lines = cvText.split('\n');

    Object.keys(competencies).forEach(comp => {
      const competency = competencies[comp];
      
      competency.keywords.forEach((keyword: string) => {
        if (lowerCvText.includes(keyword)) {
          competency.score += 1;
          
          // Find lines containing the keyword as evidence
          lines.forEach(line => {
            if (line.toLowerCase().includes(keyword) && 
                line.trim().length > 10 && line.trim().length < 150) {
              if (competency.evidence.length < 3) {
                competency.evidence.push(line.trim());
              }
            }
          });
        }
      });
      
      // Normalize score (0-10 scale)
      competency.score = Math.min(competency.score * 2, 10);
    });

    return competencies;
  }
} 