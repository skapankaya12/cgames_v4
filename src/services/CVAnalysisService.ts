export interface CVAnalysisResult {
  experience: {
    years: number;
    companies: string[];
    positions: string[];
    industries: string[];
  };
  skills: {
    technical: string[];
    soft: string[];
    leadership: string[];
    languages: string[];
  };
  education: {
    degrees: string[];
    institutions: string[];
    certifications: string[];
  };
  achievements: string[];
  keywordsFound: string[];
  competencyAlignment: {
    [key: string]: {
      score: number;
      evidence: string[];
    };
  };
}

export class CVAnalysisService {
  /**
   * Analyze CV text and extract structured information
   */
  analyzeCVText(cvText: string): CVAnalysisResult {
    const analysis: CVAnalysisResult = {
      experience: {
        years: this.extractYearsOfExperience(cvText),
        companies: this.extractCompanyNames(cvText),
        positions: this.extractPositions(cvText),
        industries: this.extractIndustries(cvText)
      },
      skills: {
        technical: this.extractTechnicalSkills(cvText),
        soft: this.extractSoftSkills(cvText),
        leadership: this.extractLeadershipSkills(cvText),
        languages: this.extractLanguages(cvText)
      },
      education: {
        degrees: this.extractDegrees(cvText),
        institutions: this.extractInstitutions(cvText),
        certifications: this.extractCertifications(cvText)
      },
      achievements: this.extractAchievements(cvText),
      keywordsFound: this.extractKeywords(cvText),
      competencyAlignment: this.analyzeCompetencyAlignment(cvText)
    };

    return analysis;
  }

  /**
   * Generate HR insights based on CV analysis
   */
  generateHRInsights(analysis: CVAnalysisResult, testScores: any[]): {
    overallAssessment: string;
    strengths: string[];
    concerns: string[];
    recommendations: string[];
    fitAnalysis: string;
  } {
    const insights = {
      overallAssessment: this.generateOverallAssessment(analysis),
      strengths: this.identifyStrengths(analysis),
      concerns: this.identifyConcerns(analysis),
      recommendations: this.generateRecommendations(analysis, testScores),
      fitAnalysis: this.analyzeFitWithTestResults(analysis, testScores)
    };

    return insights;
  }

  private extractYearsOfExperience(cvText: string): number {
    const yearPatterns = [
      /(\d+)\s*yıl/gi,
      /(\d+)\s*year/gi,
      /(\d{4})\s*-\s*(\d{4})/g,
      /(\d{4})\s*-\s*günümüz/gi,
      /(\d{4})\s*-\s*present/gi
    ];

    let totalYears = 0;
    let foundExperience = false;

    yearPatterns.forEach(pattern => {
      const matches = cvText.match(pattern);
      if (matches) {
        foundExperience = true;
        matches.forEach(match => {
          if (match.includes('-')) {
            const years = match.match(/(\d{4})/g);
            if (years && years.length >= 2) {
              const start = parseInt(years[0]);
              const end = years[1].includes('günümüz') || years[1].includes('present') 
                ? new Date().getFullYear() 
                : parseInt(years[1]);
              totalYears = Math.max(totalYears, end - start);
            }
          } else {
            const yearMatch = match.match(/(\d+)/);
            if (yearMatch) {
              totalYears = Math.max(totalYears, parseInt(yearMatch[1]));
            }
          }
        });
      }
    });

    // If no explicit experience found, estimate from education graduation
    if (!foundExperience) {
      const graduationYear = this.extractGraduationYear(cvText);
      if (graduationYear) {
        totalYears = Math.max(0, new Date().getFullYear() - graduationYear - 2);
      }
    }

    return Math.min(totalYears, 50); // Cap at 50 years
  }

  private extractGraduationYear(cvText: string): number | null {
    const graduationPatterns = [
      /mezun.*?(\d{4})/gi,
      /graduated.*?(\d{4})/gi,
      /(\d{4}).*?mezun/gi,
      /(\d{4}).*?graduated/gi
    ];

    for (const pattern of graduationPatterns) {
      const match = cvText.match(pattern);
      if (match) {
        const yearMatch = match[0].match(/(\d{4})/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          if (year >= 1970 && year <= new Date().getFullYear()) {
            return year;
          }
        }
      }
    }

    return null;
  }

  private extractCompanyNames(cvText: string): string[] {
    const companyKeywords = [
      'ltd', 'şti', 'a.ş', 'inc', 'corp', 'gmbh', 'holding', 'group',
      'teknoloji', 'bilişim', 'yazılım', 'danışmanlık', 'hizmet'
    ];

    const lines = cvText.split('\n');
    const companies: string[] = [];

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.length > 3 && cleanLine.length < 100) {
        const hasCompanyKeyword = companyKeywords.some(keyword => 
          cleanLine.toLowerCase().includes(keyword)
        );
        
        if (hasCompanyKeyword && !companies.includes(cleanLine)) {
          companies.push(cleanLine);
        }
      }
    });

    return companies.slice(0, 10); // Limit to 10 companies
  }

  private extractPositions(cvText: string): string[] {
    const positionKeywords = [
      'müdür', 'director', 'manager', 'uzman', 'specialist', 'koordinatör',
      'coordinator', 'lider', 'leader', 'şef', 'supervisor', 'sorumlu',
      'responsible', 'başkan', 'president', 'genel müdür', 'ceo', 'cto',
      'analisti', 'analyst', 'geliştirici', 'developer', 'mühendis', 'engineer'
    ];

    const positions: string[] = [];
    const lines = cvText.split('\n');

    lines.forEach(line => {
      const cleanLine = line.trim();
      positionKeywords.forEach(keyword => {
        if (cleanLine.toLowerCase().includes(keyword) && 
            cleanLine.length > 5 && cleanLine.length < 80) {
          if (!positions.includes(cleanLine)) {
            positions.push(cleanLine);
          }
        }
      });
    });

    return positions.slice(0, 15); // Limit to 15 positions
  }

  private extractIndustries(cvText: string): string[] {
    const industryKeywords = [
      'teknoloji', 'technology', 'bilişim', 'it', 'yazılım', 'software',
      'finans', 'finance', 'bankacılık', 'banking', 'sigorta', 'insurance',
      'sağlık', 'healthcare', 'eğitim', 'education', 'üretim', 'manufacturing',
      'perakende', 'retail', 'danışmanlık', 'consulting', 'medya', 'media',
      'telekomünikasyon', 'telecommunications', 'otomotiv', 'automotive'
    ];

    const industries: string[] = [];
    const lowerCvText = cvText.toLowerCase();

    industryKeywords.forEach(keyword => {
      if (lowerCvText.includes(keyword)) {
        industries.push(keyword);
      }
    });

    return [...new Set(industries)]; // Remove duplicates
  }

  private extractTechnicalSkills(cvText: string): string[] {
    const technicalKeywords = [
      'javascript', 'python', 'java', 'c#', 'php', 'sql', 'html', 'css',
      'react', 'angular', 'vue', 'node.js', 'spring', '.net', 'django',
      'aws', 'azure', 'docker', 'kubernetes', 'git', 'jenkins', 'jira',
      'excel', 'powerpoint', 'word', 'sap', 'crm', 'erp', 'tableau',
      'photoshop', 'illustrator', 'autocad', 'solidworks'
    ];

    const skills: string[] = [];
    const lowerCvText = cvText.toLowerCase();

    technicalKeywords.forEach(skill => {
      if (lowerCvText.includes(skill)) {
        skills.push(skill);
      }
    });

    return [...new Set(skills)];
  }

  private extractSoftSkills(cvText: string): string[] {
    const softSkillKeywords = [
      'liderlik', 'leadership', 'iletişim', 'communication', 'takım', 'team',
      'problem çözme', 'problem solving', 'analitik', 'analytical', 'yaratıcı',
      'creative', 'adaptasyon', 'adaptation', 'zaman yönetimi', 'time management',
      'proje yönetimi', 'project management', 'müzakere', 'negotiation'
    ];

    const skills: string[] = [];
    const lowerCvText = cvText.toLowerCase();

    softSkillKeywords.forEach(skill => {
      if (lowerCvText.includes(skill)) {
        skills.push(skill);
      }
    });

    return [...new Set(skills)];
  }

  private extractLeadershipSkills(cvText: string): string[] {
    const leadershipKeywords = [
      'liderlik', 'leadership', 'yönetim', 'management', 'ekip yönetimi',
      'team management', 'proje yönetimi', 'project management', 'mentor',
      'mentoring', 'koçluk', 'coaching', 'strateji', 'strategy', 'vizyon',
      'vision', 'karar verme', 'decision making'
    ];

    const skills: string[] = [];
    const lowerCvText = cvText.toLowerCase();

    leadershipKeywords.forEach(skill => {
      if (lowerCvText.includes(skill)) {
        skills.push(skill);
      }
    });

    return [...new Set(skills)];
  }

  private extractLanguages(cvText: string): string[] {
    const languageKeywords = [
      'türkçe', 'turkish', 'ingilizce', 'english', 'almanca', 'german',
      'fransızca', 'french', 'ispanyolca', 'spanish', 'rusça', 'russian',
      'arapça', 'arabic', 'çince', 'chinese', 'japonca', 'japanese'
    ];

    const languages: string[] = [];
    const lowerCvText = cvText.toLowerCase();

    languageKeywords.forEach(lang => {
      if (lowerCvText.includes(lang)) {
        languages.push(lang);
      }
    });

    return [...new Set(languages)];
  }

  private extractDegrees(cvText: string): string[] {
    const degreeKeywords = [
      'lisans', 'bachelor', 'yüksek lisans', 'master', 'doktora', 'phd',
      'mba', 'ön lisans', 'associate', 'lise', 'high school'
    ];

    const degrees: string[] = [];
    const lowerCvText = cvText.toLowerCase();

    degreeKeywords.forEach(degree => {
      if (lowerCvText.includes(degree)) {
        degrees.push(degree);
      }
    });

    return [...new Set(degrees)];
  }

  private extractInstitutions(cvText: string): string[] {
    const institutionKeywords = [
      'üniversite', 'university', 'institut', 'institute', 'okul', 'school',
      'akademi', 'academy', 'kolej', 'college'
    ];

    const institutions: string[] = [];
    const lines = cvText.split('\n');

    lines.forEach(line => {
      const cleanLine = line.trim();
      institutionKeywords.forEach(keyword => {
        if (cleanLine.toLowerCase().includes(keyword) && 
            cleanLine.length > 5 && cleanLine.length < 100) {
          if (!institutions.includes(cleanLine)) {
            institutions.push(cleanLine);
          }
        }
      });
    });

    return institutions.slice(0, 10);
  }

  private extractCertifications(cvText: string): string[] {
    const certificationKeywords = [
      'sertifika', 'certificate', 'sertifikasyon', 'certification',
      'diploma', 'belge', 'credential', 'pmp', 'cissp', 'itil', 'scrum'
    ];

    const certifications: string[] = [];
    const lowerCvText = cvText.toLowerCase();

    certificationKeywords.forEach(cert => {
      if (lowerCvText.includes(cert)) {
        certifications.push(cert);
      }
    });

    return [...new Set(certifications)];
  }

  private extractAchievements(cvText: string): string[] {
    const achievementKeywords = [
      'ödül', 'award', 'başarı', 'achievement', 'proje', 'project',
      'artış', 'increase', 'iyileştirme', 'improvement', 'liderlik',
      'leadership', 'yönetim', 'management', 'tasarruf', 'saving'
    ];

    const achievements: string[] = [];
    const lines = cvText.split('\n');

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.length > 20 && cleanLine.length < 200) {
        const hasAchievementKeyword = achievementKeywords.some(keyword => 
          cleanLine.toLowerCase().includes(keyword)
        );
        
        if (hasAchievementKeyword) {
          achievements.push(cleanLine);
        }
      }
    });

    return achievements.slice(0, 10);
  }

  private extractKeywords(cvText: string): string[] {
    const allKeywords = [
      'liderlik', 'leadership', 'yönetim', 'management', 'strateji', 'strategy',
      'inovation', 'inovasyon', 'dijital', 'digital', 'analiz', 'analysis',
      'proje', 'project', 'ekip', 'team', 'müşteri', 'customer', 'satış', 'sales'
    ];

    const foundKeywords: string[] = [];
    const lowerCvText = cvText.toLowerCase();

    allKeywords.forEach(keyword => {
      if (lowerCvText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

    return [...new Set(foundKeywords)];
  }

  private analyzeCompetencyAlignment(cvText: string): { [key: string]: { score: number; evidence: string[] } } {
    const competencies = {
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
      
      competency.keywords.forEach(keyword => {
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

  private generateOverallAssessment(analysis: CVAnalysisResult): string {
    const years = analysis.experience.years;
    const skillCount = analysis.skills.technical.length + analysis.skills.soft.length;
    const educationLevel = analysis.education.degrees.length;

    if (years >= 10 && skillCount >= 10 && educationLevel >= 1) {
      return 'Senior seviye adayı - Güçlü deneyim ve beceri profili';
    } else if (years >= 5 && skillCount >= 5) {
      return 'Mid-level adayı - Gelişen profesyonel profil';
    } else if (years >= 2) {
      return 'Junior-Mid level adayı - Gelişim potansiyeli yüksek';
    } else {
      return 'Entry level adayı - Eğitim ve beceri odaklı değerlendirme gerekli';
    }
  }

  private identifyStrengths(analysis: CVAnalysisResult): string[] {
    const strengths: string[] = [];

    if (analysis.experience.years >= 5) {
      strengths.push(`${analysis.experience.years} yıllık deneyim`);
    }

    if (analysis.skills.leadership.length > 0) {
      strengths.push('Liderlik deneyimi mevcut');
    }

    if (analysis.skills.technical.length >= 5) {
      strengths.push('Güçlü teknik beceri profili');
    }

    if (analysis.education.degrees.includes('yüksek lisans') || 
        analysis.education.degrees.includes('master')) {
      strengths.push('İleri düzey eğitim');
    }

    if (analysis.achievements.length >= 3) {
      strengths.push('Belgelenmiş başarı örnekleri');
    }

    return strengths.length > 0 ? strengths : ['CV analizi devam ediyor'];
  }

  private identifyConcerns(analysis: CVAnalysisResult): string[] {
    const concerns: string[] = [];

    if (analysis.experience.years < 2) {
      concerns.push('Sınırlı iş deneyimi');
    }

    if (analysis.skills.leadership.length === 0 && analysis.experience.years >= 5) {
      concerns.push('Liderlik deneyimi belirtilmemiş');
    }

    if (analysis.skills.technical.length < 3) {
      concerns.push('Teknik beceri çeşitliliği sınırlı');
    }

    if (analysis.achievements.length === 0) {
      concerns.push('Somut başarı örnekleri eksik');
    }

    return concerns.length > 0 ? concerns : ['Önemli risk faktörü tespit edilmedi'];
  }

  private generateRecommendations(analysis: CVAnalysisResult, testScores: any[]): string[] {
    const recommendations: string[] = [];

    // CV ve test uyumu kontrolü
    if (testScores && testScores.length > 0) {
      recommendations.push('CV deneyimi ile test sonuçları arasındaki tutarlılık değerlendirilmeli');
    }

    if (analysis.skills.leadership.length > 0) {
      recommendations.push('Liderlik deneyimi mülakat sürecinde detaylandırılmalı');
    }

    if (analysis.experience.years >= 5) {
      recommendations.push('Kıdemli pozisyonlar için değerlendirilebilir');
    } else {
      recommendations.push('Gelişim odaklı pozisyonlar önceliklendirilmeli');
    }

    recommendations.push('Referans kontrolü önerilir');
    recommendations.push('Pozisyon uyumu için ek değerlendirme yapılmalı');

    return recommendations;
  }

  private analyzeFitWithTestResults(analysis: CVAnalysisResult, testScores: any[]): string {
    if (!testScores || testScores.length === 0) {
      return 'Test sonuçları ile karşılaştırma için veri yetersiz';
    }

    const averageScore = testScores.reduce((sum, score) => 
      sum + (score.score / score.maxScore), 0) / testScores.length;

    const expectedPerformanceByExperience = Math.min(0.5 + (analysis.experience.years * 0.05), 0.9);

    if (averageScore >= expectedPerformanceByExperience) {
      return 'Test sonuçları deneyim seviyesi ile uyumlu veya üzerinde';
    } else if (averageScore >= expectedPerformanceByExperience - 0.15) {
      return 'Test sonuçları deneyim seviyesi ile genel uyum gösteriyor';
    } else {
      return 'Test sonuçları deneyim seviyesinin altında - ek değerlendirme gerekli';
    }
  }
} 