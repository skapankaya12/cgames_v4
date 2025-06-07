import type { CVAnalysisResult } from '@cgames/types/CVTypes';

export class HRInsightsGenerator {
  generate(analysis: CVAnalysisResult, testScores: any[]): {
    overallAssessment: string;
    strengths: string[];
    concerns: string[];
    recommendations: string[];
    fitAnalysis: string;
  } {
    return {
      overallAssessment: this.generateOverallAssessment(analysis),
      strengths: this.identifyStrengths(analysis),
      concerns: this.identifyConcerns(analysis),
      recommendations: this.generateRecommendations(analysis, testScores),
      fitAnalysis: this.analyzeFitWithTestResults(analysis, testScores)
    };
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

    if (analysis.skills.technical.length < 3) {
      concerns.push('Teknik beceri profili geliştirilebilir');
    }

    if (analysis.skills.soft.length < 3) {
      concerns.push('Soft skill alanında gelişim gerekli');
    }

    if (analysis.education.degrees.length === 0) {
      concerns.push('Formal eğitim bilgisi eksik');
    }

    if (analysis.achievements.length === 0) {
      concerns.push('Belgelenmiş başarı örnekleri sınırlı');
    }

    return concerns;
  }

  private generateRecommendations(analysis: CVAnalysisResult, testScores: any[]): string[] {
    const recommendations: string[] = [];

    // Experience-based recommendations
    if (analysis.experience.years < 3) {
      recommendations.push('Deneyim kazanımına odaklanması önerilir');
    }

    if (analysis.skills.leadership.length === 0 && analysis.experience.years >= 3) {
      recommendations.push('Liderlik becerilerini geliştirmeye odaklanmalı');
    }

    // Education-based recommendations
    if (!analysis.education.degrees.includes('yüksek lisans') && 
        !analysis.education.degrees.includes('master') && 
        analysis.experience.years >= 5) {
      recommendations.push('İleri düzey eğitim programları değerlendirilebilir');
    }

    // Skill-based recommendations
    if (analysis.skills.technical.length < 5) {
      recommendations.push('Teknik beceri repertuvarını genişletmeli');
    }

    // Test score integration
    if (testScores.length > 0) {
      const averageScore = testScores.reduce((sum, score) => sum + score.score, 0) / testScores.length;
      if (averageScore < 60) {
        recommendations.push('Problem çözme ve karar verme becerilerini geliştirmeli');
      }
    }

    return recommendations.length > 0 ? recommendations : ['Genel gelişim planı önerilir'];
  }

  private analyzeFitWithTestResults(analysis: CVAnalysisResult, testScores: any[]): string {
    if (testScores.length === 0) {
      return 'Test sonuçları mevcut değil - CV bazlı değerlendirme';
    }

    const averageTestScore = testScores.reduce((sum, score) => sum + score.score, 0) / testScores.length;
    const experienceLevel = analysis.experience.years;

    if (averageTestScore >= 80 && experienceLevel >= 5) {
      return 'Mükemmel uyum - Hem deneyim hem test performansı güçlü';
    } else if (averageTestScore >= 70 && experienceLevel >= 3) {
      return 'İyi uyum - Pozisyon için uygun profil';
    } else if (averageTestScore >= 60 || experienceLevel >= 2) {
      return 'Orta düzey uyum - Gelişim potansiyeli mevcut';
    } else {
      return 'Uyum seviyeleri değerlendirilmeli - Ek değerlendirme önerilir';
    }
  }
} 