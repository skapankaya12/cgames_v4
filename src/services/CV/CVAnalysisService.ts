import type { CVAnalysisResult } from '../../types/CVTypes';
import { PersonalInfoExtractor } from './extractors/PersonalInfoExtractor';
import { ExperienceExtractor } from './extractors/ExperienceExtractor';
import { SkillsExtractor } from './extractors/SkillsExtractor';
import { EducationExtractor } from './extractors/EducationExtractor';
import { CompetencyAnalyzer } from './analyzers/CompetencyAnalyzer';
import { HRInsightsGenerator } from './generators/HRInsightsGenerator';

export class CVAnalysisService {
  private personalInfoExtractor: PersonalInfoExtractor;
  private experienceExtractor: ExperienceExtractor;
  private skillsExtractor: SkillsExtractor;
  private educationExtractor: EducationExtractor;
  private competencyAnalyzer: CompetencyAnalyzer;
  private hrInsightsGenerator: HRInsightsGenerator;

  constructor() {
    this.personalInfoExtractor = new PersonalInfoExtractor();
    this.experienceExtractor = new ExperienceExtractor();
    this.skillsExtractor = new SkillsExtractor();
    this.educationExtractor = new EducationExtractor();
    this.competencyAnalyzer = new CompetencyAnalyzer();
    this.hrInsightsGenerator = new HRInsightsGenerator();
  }

  /**
   * Analyze CV text and extract structured information
   */
  analyzeCVText(cvText: string): CVAnalysisResult {
    const analysis: CVAnalysisResult = {
      personalInfo: this.personalInfoExtractor.extract(cvText),
      experience: this.experienceExtractor.extract(cvText),
      skills: this.skillsExtractor.extract(cvText),
      education: this.educationExtractor.extract(cvText),
      achievements: this.experienceExtractor.extractAchievements(cvText),
      keywordsFound: this.skillsExtractor.extractKeywords(cvText),
      competencyAlignment: this.competencyAnalyzer.analyze(cvText)
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
    return this.hrInsightsGenerator.generate(analysis, testScores);
  }
} 