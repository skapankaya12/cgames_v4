import * as pdfjsLib from 'pdfjs-dist';
import { CVAnalysisService } from './CVAnalysisService';
import type { CVAnalysisResult, CVData } from '../types/CVTypes';
import { PDFDebugUtils } from '../utils/pdfDebug';

// Re-export for backwards compatibility
export type { CVData, CVAnalysisResult } from '../types/CVTypes';

// Configure PDF.js worker - use a more robust approach for Vite
if (typeof window !== 'undefined') {
  // In browser environment
  try {
    // Use the worker file from public directory for better reliability
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    console.log('✅ PDF.js worker configured with public directory worker');
  } catch (error) {
    // Ultimate fallback - use inline worker
    console.warn('⚠️ Worker setup failed, using inline worker:', error);
    // Let PDF.js create an inline worker as fallback
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
  }
}

export class CVTextExtractionService {
  private cvAnalysisService: CVAnalysisService;

  constructor() {
    this.cvAnalysisService = new CVAnalysisService();
    
    // Log PDF.js configuration for debugging
    if (process.env.NODE_ENV === 'development') {
      PDFDebugUtils.logDebugInfo();
    }
  }

  /**
   * Extract text from PDF file and analyze CV content
   */
  async extractCVData(file: File, testScores?: any[]): Promise<CVData> {
    try {
      console.log('📄 Starting CV text extraction process...');
      
      // Validate file
      if (!file || file.type !== 'application/pdf') {
        throw new Error('Invalid file type. Only PDF files are supported.');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size too large. Maximum size is 10MB.');
      }

      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document with enhanced error handling
      let pdf;
      try {
        console.log('📄 Loading PDF document...');
        // Use simple configuration first to avoid network dependencies
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      } catch (pdfError) {
        console.error('❌ PDF loading failed:', pdfError);
        
        // Try with minimal configuration as fallback
        try {
          console.log('🔄 Retrying PDF load with minimal configuration...');
          pdf = await pdfjsLib.getDocument({ 
            data: arrayBuffer,
            useSystemFonts: true,
            disableFontFace: false
          }).promise;
        } catch (secondError) {
          throw new Error(`Failed to load PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown PDF error'}`);
        }
      }
      
      console.log(`📄 PDF loaded with ${pdf.numPages} pages`);
      
      // Extract text from all pages
      let extractedText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => {
              // Extract text content with proper spacing
              return typeof item.str === 'string' ? item.str : '';
            })
            .join(' ');
          
          extractedText += pageText + '\n';
        } catch (pageError) {
          console.warn(`⚠️ Failed to extract text from page ${pageNum}:`, pageError);
          // Continue with other pages
        }
      }
      
      // Clean up extracted text
      extractedText = this.cleanExtractedText(extractedText);
      
      if (!extractedText || extractedText.length < 50) {
        throw new Error('Could not extract enough text from PDF. The file might be encrypted, image-based, or corrupted.');
      }
      
      console.log('📄 Extracted text length:', extractedText.length);
      console.log('📄 Text preview:', extractedText.substring(0, 200) + '...');
      
      // Analyze CV content
      const analysis = this.cvAnalysisService.analyzeCVText(extractedText);
      
      // Generate HR insights
      const hrInsights = this.cvAnalysisService.generateHRInsights(analysis, testScores || []);
      
      const cvData: CVData = {
        fileName: file.name,
        extractedText,
        analysis,
        hrInsights,
        extractedAt: new Date().toISOString()
      };
      
      console.log('✅ CV analysis completed:', cvData);
      return cvData;
      
    } catch (error) {
      console.error('❌ CV text extraction failed:', error);
      
      // Use debug utils for better error messages
      if (error instanceof Error) {
        const friendlyError = PDFDebugUtils.getUserFriendlyError(error);
        throw new Error(friendlyError);
      } else {
        throw new Error('CV yükleme sırasında bilinmeyen bir hata oluştu.');
      }
    }
  }

  /**
   * Clean and format extracted text
   */
  private cleanExtractedText(text: string): string {
    return text
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove empty lines
      .replace(/\n\s*\n/g, '\n')
      // Trim each line
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();
  }

  /**
   * Store CV data in session storage for persistence
   */
  storeCVData(cvData: CVData): void {
    try {
      sessionStorage.setItem('cvData', JSON.stringify(cvData));
      console.log('💾 CV data stored in session storage');
    } catch (error) {
      console.error('❌ Failed to store CV data:', error);
    }
  }

  /**
   * Retrieve CV data from session storage
   */
  getCVData(): CVData | null {
    try {
      const storedData = sessionStorage.getItem('cvData');
      if (storedData) {
        const cvData = JSON.parse(storedData);
        console.log('📂 CV data retrieved from session storage');
        return cvData;
      }
    } catch (error) {
      console.error('❌ Failed to retrieve CV data:', error);
    }
    return null;
  }

  /**
   * Clear CV data from session storage
   */
  clearCVData(): void {
    try {
      sessionStorage.removeItem('cvData');
      console.log('🗑️ CV data cleared from session storage');
    } catch (error) {
      console.error('❌ Failed to clear CV data:', error);
    }
  }

  /**
   * Generate CV summary for display
   */
  generateCVSummary(cvData: CVData): {
    experienceSummary: string;
    keySkills: string[];
    educationSummary: string;
    careerLevel: string;
    industryFocus: string[];
  } {
    const { analysis } = cvData;
    
    return {
      experienceSummary: `${analysis.experience.years} yıl deneyim, ${analysis.experience.companies.length} şirkette çalışmış`,
      keySkills: [
        ...analysis.skills.technical.slice(0, 5),
        ...analysis.skills.leadership.slice(0, 3),
        ...analysis.skills.soft.slice(0, 2)
      ].slice(0, 8),
      educationSummary: analysis.education.degrees.length > 0 
        ? `${analysis.education.degrees[0]}${analysis.education.institutions.length > 0 ? ` - ${analysis.education.institutions[0]}` : ''}`
        : 'Eğitim bilgisi bulunamadı',
      careerLevel: this.determineCareerLevel(analysis),
      industryFocus: analysis.experience.industries.slice(0, 3)
    };
  }

  /**
   * Determine career level based on experience and positions
   */
  private determineCareerLevel(analysis: CVAnalysisResult): string {
    const years = analysis.experience.years;
    const positions = analysis.experience.positions.join(' ').toLowerCase();
    
    const isExecutive = /ceo|cto|vp|genel müdür|başkan/.test(positions);
    const isManager = /müdür|director|manager|lider|leader/.test(positions);
    const isSenior = /senior|uzman|specialist|koordinatör/.test(positions);
    
    if (isExecutive || years >= 15) {
      return 'Üst Düzey Yönetici';
    } else if (isManager || years >= 8) {
      return 'Orta Düzey Yönetici';
    } else if (isSenior || years >= 4) {
      return 'Kıdemli Uzman';
    } else if (years >= 2) {
      return 'Uzman';
    } else {
      return 'Başlangıç Seviyesi';
    }
  }

  /**
   * Align CV skills with competency scores for enhanced analysis
   */
  alignCVWithCompetencies(cvData: CVData, competencyScores: any[]): {
    [competency: string]: {
      cvEvidence: string[];
      scoreAlignment: string;
      recommendation: string;
    }
  } {
    const alignment: any = {};
    const { analysis } = cvData;
    
    // Map competencies to CV evidence
    const competencyMapping = {
      'DM': { // Decision Making
        keywords: ['karar', 'decision', 'stratejik', 'analiz', 'çözüm'],
        cvSources: [...analysis.skills.leadership, ...analysis.achievements]
      },
      'IN': { // Initiative
        keywords: ['girişim', 'initiative', 'proje', 'liderlik', 'yenilik'],
        cvSources: [...analysis.achievements, ...analysis.skills.leadership]
      },
      'AD': { // Adaptation
        keywords: ['adaptasyon', 'adaptation', 'esneklik', 'değişim', 'öğrenme'],
        cvSources: [...analysis.skills.soft, ...analysis.experience.industries]
      },
      'CM': { // Communication
        keywords: ['iletişim', 'communication', 'sunum', 'presentation'],
        cvSources: [...analysis.skills.soft, ...analysis.skills.languages]
      },
      'ST': { // Strategic Thinking
        keywords: ['stratejik', 'strategic', 'planlama', 'vizyon', 'analitik'],
        cvSources: [...analysis.skills.leadership, ...analysis.achievements]
      },
      'TO': { // Teamwork
        keywords: ['takım', 'team', 'işbirliği', 'collaboration', 'ekip'],
        cvSources: [...analysis.skills.soft, ...analysis.experience.positions]
      },
      'RL': { // Risk Leadership
        keywords: ['risk', 'yönetim', 'management', 'liderlik', 'kontrol'],
        cvSources: [...analysis.skills.leadership, ...analysis.achievements]
      },
      'RI': { // Risk Intelligence
        keywords: ['risk', 'analiz', 'analysis', 'değerlendirme', 'akıl'],
        cvSources: [...analysis.skills.technical, ...analysis.skills.leadership]
      }
    };

    competencyScores.forEach(score => {
      const competency = score.abbreviation || score.dimension;
      const mapping = competencyMapping[competency as keyof typeof competencyMapping];
      
      if (mapping) {
        // Find CV evidence for this competency
        const evidence = mapping.cvSources.filter(item => 
          mapping.keywords.some(keyword => 
            item.toLowerCase().includes(keyword)
          )
        );

        // Determine alignment
        const scorePercentage = (score.score / score.maxScore) * 100;
        const evidenceLevel = evidence.length > 2 ? 'strong' : evidence.length > 0 ? 'moderate' : 'weak';
        
        let scoreAlignment = '';
        let recommendation = '';
        
        if (evidenceLevel === 'strong' && scorePercentage >= 70) {
          scoreAlignment = 'Güçlü Uyum';
          recommendation = 'CV deneyimi test sonuçlarını destekliyor. Bu alanda güçlü bir aday.';
        } else if (evidenceLevel === 'moderate' || scorePercentage >= 50) {
          scoreAlignment = 'Orta Uyum';
          recommendation = 'CV deneyimi ile test sonuçları kısmen uyumlu. Gelişim potansiyeli var.';
        } else {
          scoreAlignment = 'Zayıf Uyum';
          recommendation = 'CV deneyimi test sonuçlarından farklı gösteriyor. Derinlemesine değerlendirme gerekli.';
        }

        alignment[competency] = {
          cvEvidence: evidence.slice(0, 3), // Top 3 evidence
          scoreAlignment,
          recommendation
        };
      }
    });

    return alignment;
  }
} 