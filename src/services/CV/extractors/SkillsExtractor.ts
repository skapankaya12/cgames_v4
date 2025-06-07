export class SkillsExtractor {
  extract(cvText: string) {
    return {
      technical: this.extractTechnicalSkills(cvText),
      soft: this.extractSoftSkills(cvText),
      leadership: this.extractLeadershipSkills(cvText),
      languages: this.extractLanguages(cvText)
    };
  }

  extractKeywords(cvText: string): string[] {
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
} 