export class ExperienceExtractor {
  extract(cvText: string) {
    return {
      years: this.extractYearsOfExperience(cvText),
      companies: this.extractCompanyNames(cvText),
      positions: this.extractPositions(cvText),
      industries: this.extractIndustries(cvText)
    };
  }

  extractAchievements(cvText: string): string[] {
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
} 