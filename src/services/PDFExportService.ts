import jsPDF from 'jspdf';
import type { SessionAnalytics } from './InteractionTracker';
import type { PersonalizedRecommendations } from '../types/Recommendations';

export interface ExportData {
  user: {
    firstName: string;
    lastName: string;
    company?: string;
  };
  scores: Array<{
    name: string;
    score: number;
    maxScore: number;
    abbreviation: string;
    fullName: string;
    category: string;
    description: string;
    color: string;
  }>;
  interactionAnalytics?: SessionAnalytics;
  recommendations?: string[];
  personalizedRecommendations?: PersonalizedRecommendations | null;
  exportDate: string;
}

export class PDFExportService {
  /**
   * Export user results as a comprehensive professional PDF report
   */
  async exportToPDF(data: ExportData): Promise<void> {
    try {
      console.log('📄 Starting comprehensive PDF export process...');
      
      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Set up fonts and colors
      pdf.setFont('helvetica');
      
      // Page 1: Enhanced Cover Page
      this.createEnhancedCoverPage(pdf, data, pageWidth, pageHeight, margin, contentWidth);
      
      // Page 2: Executive Summary
      pdf.addPage();
      this.createExecutiveSummary(pdf, data, pageWidth, margin, contentWidth);
      
      // Page 3: Competency Analysis
      pdf.addPage();
      this.createCompetencyAnalysis(pdf, data, margin, contentWidth);
      
      // Page 4: Behavioral Analytics
      if (data.interactionAnalytics) {
        pdf.addPage();
        this.createBehavioralAnalytics(pdf, data, margin, contentWidth);
      }
      
      // Page 5+: AI Personalized Recommendations (if available)
      if (data.personalizedRecommendations?.recommendations && 
          data.personalizedRecommendations.recommendations.length > 0) {
        pdf.addPage();
        this.createAIRecommendationsSection(pdf, data, margin, contentWidth);
      }
      
      // Page N: Development Recommendations
      pdf.addPage();
      this.createDevelopmentRecommendations(pdf, data, margin, contentWidth);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${data.user.firstName}_${data.user.lastName}_Liderlik_Raporu_${timestamp}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      
      console.log('✅ Comprehensive PDF export completed successfully:', fileName);
      
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create enhanced cover page with modern design
   */
  private createEnhancedCoverPage(pdf: jsPDF, data: ExportData, pageWidth: number, pageHeight: number, margin: number, contentWidth: number): void {
    // Gradient header background (simulated with rectangles)
    pdf.setFillColor(30, 41, 59);
    pdf.rect(0, 0, pageWidth, 100, 'F');
    
    pdf.setFillColor(45, 56, 74);
    pdf.rect(0, 80, pageWidth, 20, 'F');
    
    // Company/System logo area
    pdf.setFillColor(255, 255, 255);
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LIDERLIK YETKINLIK SISTEMI', pageWidth / 2, 15, { align: 'center' });
    
    // Main title with enhanced typography
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LIDERLIK YETKINLIK', pageWidth / 2, 45, { align: 'center' });
    pdf.text('RAPORU', pageWidth / 2, 65, { align: 'center' });
    
    // Subtitle
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('AI Destekli Kapsamlı Analiz ve Değerlendirme', pageWidth / 2, 85, { align: 'center' });
    
    // User information card
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, 120, contentWidth, 70, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(margin, 120, contentWidth, 70);
    
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('KATILIMCI BİLGİLERİ', margin + 10, 135);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Ad Soyad: ${data.user.firstName} ${data.user.lastName}`, margin + 10, 150);
    
    if (data.user.company) {
      pdf.text(`Şirket: ${data.user.company}`, margin + 10, 165);
    }
    
    pdf.text(`Rapor Tarihi: ${new Date(data.exportDate).toLocaleDateString('tr-TR')}`, margin + 10, 180);
    
    // Overall performance showcase
    const overallScore = Math.round(
      data.scores.reduce((sum, comp) => sum + (comp.score / comp.maxScore) * 100, 0) / data.scores.length
    );
    
    // Performance circle with gradient effect
    const centerX = pageWidth / 2;
    const centerY = 230;
    const radius = 35;
    
    // Outer ring
    pdf.setFillColor(226, 232, 240);
    pdf.circle(centerX, centerY, radius + 5, 'F');
    
    // Inner circle
    pdf.setFillColor(255, 255, 255);
    pdf.circle(centerX, centerY, radius, 'F');
    
    // Score color based on performance
    let scoreColor = [239, 68, 68]; // Red
    let levelText = 'Gelişim Alanı';
    let levelColor = 'Kırmızı';
    
    if (overallScore >= 80) {
      scoreColor = [34, 197, 94]; // Green
      levelText = 'Mükemmel';
      levelColor = 'Yeşil';
    } else if (overallScore >= 60) {
      scoreColor = [59, 130, 246]; // Blue
      levelText = 'İyi';
      levelColor = 'Mavi';
    } else if (overallScore >= 40) {
      scoreColor = [245, 158, 11]; // Orange
      levelText = 'Orta';
      levelColor = 'Turuncu';
    }
    
    // Score text
    pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${overallScore}%`, centerX, centerY + 2, { align: 'center' });
    
    // Performance level
    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GENEL PERFORMANS', centerX, centerY - 45, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(levelText, centerX, centerY + 25, { align: 'center' });
    
    // Performance indicators
    const indicators = [
      { label: 'Liderlik', score: Math.round(data.scores.filter(s => s.category === 'liderlik').reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / data.scores.filter(s => s.category === 'liderlik').length || 0) },
      { label: 'İletişim', score: Math.round(data.scores.filter(s => s.category === 'iletişim').reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / data.scores.filter(s => s.category === 'iletişim').length || 0) },
      { label: 'Stratejik', score: Math.round(data.scores.filter(s => s.category === 'stratejik').reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / data.scores.filter(s => s.category === 'stratejik').length || 0) },
      { label: 'Risk', score: Math.round(data.scores.filter(s => s.category === 'risk').reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / data.scores.filter(s => s.category === 'risk').length || 0) }
    ];
    
    let startY = 270;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    
    indicators.forEach((indicator, index) => {
      if (!isNaN(indicator.score)) {
        const xPos = margin + (index * (contentWidth / 4));
        pdf.text(indicator.label, xPos + 30, startY);
        pdf.text(`${indicator.score}%`, xPos + 30, startY + 10);
      }
    });
    
    // Footer
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Bu rapor yapay zeka destekli analiz ile oluşturulmuştur.', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text('Confidential & Professional Assessment Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  /**
   * Create executive summary page
   */
  private createExecutiveSummary(pdf: jsPDF, data: ExportData, pageWidth: number, margin: number, contentWidth: number): void {
    let yPosition = margin;
    
    // Page title
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ÖZET RAPOR', margin, yPosition);
    yPosition += 15;
    
    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text('Genel değerlendirme ve temel bulgular', margin, yPosition);
    yPosition += 25;
    
    // Overall Performance Box
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPosition, contentWidth, 40, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(margin, yPosition, contentWidth, 40);
    
    const overallScore = Math.round(
      data.scores.reduce((sum, comp) => sum + (comp.score / comp.maxScore) * 100, 0) / data.scores.length
    );
    
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GENEL PERFORMANS SKORU', margin + 10, yPosition + 15);
    
    let performanceText = 'Gelişim Alanı';
    let performanceColor = [239, 68, 68];
    if (overallScore >= 80) {
      performanceText = 'Mükemmel';
      performanceColor = [34, 197, 94];
    } else if (overallScore >= 60) {
      performanceText = 'İyi';
      performanceColor = [59, 130, 246];
    } else if (overallScore >= 40) {
      performanceText = 'Orta';
      performanceColor = [245, 158, 11];
    }
    
    pdf.setTextColor(performanceColor[0], performanceColor[1], performanceColor[2]);
    pdf.setFontSize(20);
    pdf.text(`${overallScore}% - ${performanceText}`, margin + 10, yPosition + 30);
    
    yPosition += 60;
    
    // Top 3 Strengths
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EN GÜÇLÜ ALANLAR', margin, yPosition);
    yPosition += 15;
    
    const topScores = [...data.scores]
      .sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore))
      .slice(0, 3);
    
    topScores.forEach((comp, index) => {
      const percentage = Math.round((comp.score / comp.maxScore) * 100);
      pdf.setTextColor(34, 197, 94);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${comp.fullName}`, margin + 5, yPosition);
      
      pdf.setTextColor(71, 85, 105);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${percentage}%`, contentWidth + margin - 30, yPosition);
      
      yPosition += 8;
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(10);
      const description = pdf.splitTextToSize(comp.description, contentWidth - 40);
      pdf.text(description, margin + 10, yPosition);
      yPosition += description.length * 4 + 8;
    });
    
    yPosition += 10;
    
    // Development Areas
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GELİŞİM ALANLARI', margin, yPosition);
    yPosition += 15;
    
    const developmentAreas = [...data.scores]
      .sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore))
      .slice(0, 3);
    
    developmentAreas.forEach((comp, index) => {
      const percentage = Math.round((comp.score / comp.maxScore) * 100);
      pdf.setTextColor(239, 68, 68);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${comp.fullName}`, margin + 5, yPosition);
      
      pdf.setTextColor(71, 85, 105);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${percentage}%`, contentWidth + margin - 30, yPosition);
      
      yPosition += 8;
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(10);
      const description = pdf.splitTextToSize(comp.description, contentWidth - 40);
      pdf.text(description, margin + 10, yPosition);
      yPosition += description.length * 4 + 8;
    });
  }

  /**
   * Create competency analysis page
   */
  private createCompetencyAnalysis(pdf: jsPDF, data: ExportData, margin: number, contentWidth: number): void {
    let yPosition = margin;
    
    // Page title
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('YETKİNLİK ANALİZİ', margin, yPosition);
    yPosition += 20;
    
    // Group competencies by category
    const categories: { [key: string]: typeof data.scores } = {};
    data.scores.forEach(comp => {
      const categoryName = comp.category || 'Genel';
      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }
      categories[categoryName].push(comp);
    });
    
    // Display each category
    Object.entries(categories).forEach(([category, competencies]) => {
      // Category header with colored background
      const categoryColors: { [key: string]: number[] } = {
        'liderlik': [99, 102, 241],
        'iletişim': [16, 185, 129],
        'stratejik': [245, 158, 11],
        'risk': [239, 68, 68],
        'Genel': [107, 114, 128]
      };
      
      const categoryColor = categoryColors[category] || [107, 114, 128];
      
      pdf.setFillColor(categoryColor[0], categoryColor[1], categoryColor[2]);
      pdf.rect(margin, yPosition - 5, contentWidth, 15, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(category.toUpperCase(), margin + 5, yPosition + 5);
      yPosition += 20;
      
      // Competencies in this category
      competencies.forEach(comp => {
        const percentage = Math.round((comp.score / comp.maxScore) * 100);
        
        // Competency name and score
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(comp.fullName, margin + 5, yPosition);
        
        // Score badge
        let scoreColor = [239, 68, 68]; // Red
        if (percentage >= 80) scoreColor = [34, 197, 94]; // Green
        else if (percentage >= 60) scoreColor = [59, 130, 246]; // Blue
        else if (percentage >= 40) scoreColor = [245, 158, 11]; // Orange
        
        pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        pdf.rect(contentWidth + margin - 35, yPosition - 8, 30, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${percentage}%`, contentWidth + margin - 20, yPosition - 1, { align: 'center' });
        
        yPosition += 8;
        
        // Progress bar
        const barWidth = contentWidth - 50;
        pdf.setFillColor(226, 232, 240);
        pdf.rect(margin + 5, yPosition, barWidth, 4, 'F');
        
        const fillWidth = (barWidth * percentage) / 100;
        pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        pdf.rect(margin + 5, yPosition, fillWidth, 4, 'F');
        
        yPosition += 10;
        
        // Description
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const description = pdf.splitTextToSize(comp.description, contentWidth - 10);
        pdf.text(description, margin + 5, yPosition);
        yPosition += description.length * 4 + 2;
        
        // Insight
        let insight = '';
        if (percentage >= 80) {
          insight = '✓ Mükemmel performans - Bu alanda mentor olabilir';
        } else if (percentage >= 60) {
          insight = '→ İyi performans - Küçük iyileştirmelerle güçlenebilir';
        } else if (percentage >= 40) {
          insight = '⚠ Orta seviye - Odaklanarak gelişim sağlanabilir';
        } else {
          insight = '⚡ Gelişim alanı - Temel becerileri güçlendirme gerekiyor';
        }
        
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.text(insight, margin + 5, yPosition);
        yPosition += 15;
        
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = margin;
        }
      });
      
      yPosition += 5;
    });
  }

  /**
   * Create behavioral analytics page
   */
  private createBehavioralAnalytics(pdf: jsPDF, data: ExportData, margin: number, contentWidth: number): void {
    let yPosition = margin;
    
    // Page title
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DAVRANIŞ ANALİZİ', margin, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text('Test sırasındaki davranış kalıpları ve etkileşim analizi', margin, yPosition);
    yPosition += 25;
    
    if (data.interactionAnalytics) {
      // Analytics cards
      const analyticsData = [
        {
          title: 'Ortalama Yanıt Süresi',
          value: `${Math.round(data.interactionAnalytics.averageResponseTime / 1000)} saniye`,
          description: 'Sorulara çabuk yanıt verme eğilimi',
          icon: '⏱️'
        },
        {
          title: 'Cevap Değişikliği',
          value: `${data.interactionAnalytics.totalAnswerChanges || 0} kez`,
          description: 'Verilen cevapları tekrar değerlendirme eğilimi',
          icon: '🔄'
        },
        {
          title: 'Geri Dönüş',
          value: `${data.interactionAnalytics.totalBackNavigations || 0} kez`,
          description: 'Önceki sorulara geri dönme sıklığı',
          icon: '⬅️'
        },
        {
          title: 'Tamamlanma Oranı',
          value: `${Math.round((data.interactionAnalytics.completedQuestions / data.interactionAnalytics.totalQuestions) * 100)}%`,
          description: 'Test tamamlama başarısı',
          icon: '✅'
        }
      ];
      
      analyticsData.forEach((item, index) => {
        const cardY = yPosition + Math.floor(index / 2) * 50;
        const cardX = margin + (index % 2) * (contentWidth / 2);
        const cardWidth = (contentWidth / 2) - 5;
        
        // Card background
        pdf.setFillColor(248, 250, 252);
        pdf.rect(cardX, cardY, cardWidth, 40, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(cardX, cardY, cardWidth, 40);
        
        // Icon and title
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${item.icon} ${item.title}`, cardX + 5, cardY + 10);
        
        // Value
        pdf.setTextColor(59, 130, 246);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.value, cardX + 5, cardY + 22);
        
        // Description
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        const descLines = pdf.splitTextToSize(item.description, cardWidth - 10);
        pdf.text(descLines, cardX + 5, cardY + 30);
      });
      
      yPosition += 110;
      
      // Behavioral insights
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DAVRANIŞ DESENLERİ', margin, yPosition);
      yPosition += 15;
      
      const avgTime = Math.round(data.interactionAnalytics.averageResponseTime / 1000);
      const insights = [];
      
      if (avgTime < 30) {
        insights.push('• Hızlı karar verme: Sorulara çabuk yanıt verme eğilimi gösteriyor');
      } else if (avgTime > 60) {
        insights.push('• Düşünceli yaklaşım: Sorulara detaylı düşünerek yanıt veriyor');
      } else {
        insights.push('• Dengeli yaklaşım: Sorulara orta tempoda ve düşünerek yanıt veriyor');
      }
      
      if ((data.interactionAnalytics.totalAnswerChanges || 0) > 5) {
        insights.push('• Yüksek öz-değerlendirme: Cevaplarını sık sık gözden geçiriyor');
      } else if ((data.interactionAnalytics.totalAnswerChanges || 0) < 2) {
        insights.push('• Kararlı yaklaşım: İlk düşüncelerine güveniyor');
      }
      
      if ((data.interactionAnalytics.totalBackNavigations || 0) > 3) {
        insights.push('• Kapsamlı değerlendirme: Genel tutarlılığı kontrol etme eğilimi');
      }
      
      insights.forEach(insight => {
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(insight, contentWidth - 10);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * 6 + 5;
      });
    }
  }

  /**
   * Create AI recommendations section
   */
  private createAIRecommendationsSection(pdf: jsPDF, data: ExportData, margin: number, contentWidth: number): void {
    let yPosition = margin;
    
    // Page title
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI DESTEKLİ RAPOR', margin, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text('Yapay zeka destekli kişiselleştirilmiş analiz ve öneriler', margin, yPosition);
    yPosition += 25;
    
    if (data.personalizedRecommendations?.recommendations) {
      const aiRecommendations = data.personalizedRecommendations.recommendations
        .filter(rec => rec.dimension === 'AI_REPORT');
      
      if (aiRecommendations.length > 0) {
        const aiRec = aiRecommendations[0];
        
        // AI Analysis Header
        pdf.setFillColor(99, 102, 241);
        pdf.rect(margin, yPosition, contentWidth, 20, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🤖 YAPAY ZEKA ANALİZİ', margin + 10, yPosition + 12);
        yPosition += 35;
        
        // Analysis content - First paragraph
        if (aiRec.description) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, yPosition, contentWidth, Math.min(60, aiRec.description.length / 3), 'F');
          pdf.setDrawColor(226, 232, 240);
          pdf.rect(margin, yPosition, contentWidth, Math.min(60, aiRec.description.length / 3));
          
          pdf.setTextColor(59, 130, 246);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('YETKİNLİK ve CV UYUM DEĞERLENDİRMESİ', margin + 10, yPosition + 15);
          
          pdf.setTextColor(30, 41, 59);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const descLines = pdf.splitTextToSize(aiRec.description, contentWidth - 20);
          pdf.text(descLines, margin + 10, yPosition + 25);
          yPosition += Math.max(60, descLines.length * 4 + 35);
        }
        
        yPosition += 10;
        
        // Analysis content - Second paragraph (reasoning)
        if (aiRec.reasoning) {
          pdf.setFillColor(240, 253, 244);
          pdf.rect(margin, yPosition, contentWidth, Math.min(60, aiRec.reasoning.length / 3), 'F');
          pdf.setDrawColor(16, 185, 129);
          pdf.rect(margin, yPosition, contentWidth, Math.min(60, aiRec.reasoning.length / 3));
          
          pdf.setTextColor(16, 185, 129);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('MÜLAKAT REHBERİ ve ÖNERİLER', margin + 10, yPosition + 15);
          
          pdf.setTextColor(30, 41, 59);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const reasonLines = pdf.splitTextToSize(aiRec.reasoning, contentWidth - 20);
          pdf.text(reasonLines, margin + 10, yPosition + 25);
          yPosition += Math.max(60, reasonLines.length * 4 + 35);
        }
        
        // AI Transparency Info
        yPosition += 15;
        pdf.setFillColor(255, 251, 235);
        pdf.rect(margin, yPosition, contentWidth, 30, 'F');
        pdf.setDrawColor(245, 158, 11);
        pdf.rect(margin, yPosition, contentWidth, 30);
        
        pdf.setTextColor(245, 158, 11);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📊 AI ŞEFFAFLIK BİLGİLERİ', margin + 10, yPosition + 12);
        
        pdf.setTextColor(120, 53, 15);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const aiInfo = [
          `Model: ${data.personalizedRecommendations.aiModel || 'AI Sistemi'}`,
          `Güven Skoru: ${data.personalizedRecommendations.confidenceScore || 85}%`,
          `Oluşturulma: ${new Date(data.personalizedRecommendations.generatedAt).toLocaleDateString('tr-TR')}`
        ].join(' | ');
        pdf.text(aiInfo, margin + 10, yPosition + 22);
      }
    }
  }

  /**
   * Create development recommendations page
   */
  private createDevelopmentRecommendations(pdf: jsPDF, data: ExportData, margin: number, contentWidth: number): void {
    let yPosition = margin;
    
    // Page title
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GELİŞİM ÖNERİLERİ', margin, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text('Kişiselleştirilmiş gelişim planı ve eylem önerileri', margin, yPosition);
    yPosition += 25;
    
    // Basic recommendations from scores
    if (data.recommendations && data.recommendations.length > 0) {
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TEMEL GELİŞİM ÖNERİLERİ', margin, yPosition);
      yPosition += 15;
      
      data.recommendations.forEach((recommendation, index) => {
        // Recommendation card
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPosition, contentWidth, 25, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(margin, yPosition, contentWidth, 25);
        
        // Bullet number
        pdf.setFillColor(59, 130, 246);
        pdf.circle(margin + 15, yPosition + 12, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}`, margin + 15, yPosition + 15, { align: 'center' });
        
        // Recommendation text
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(recommendation, contentWidth - 40);
        pdf.text(lines, margin + 30, yPosition + 8);
        
        yPosition += 30;
        
        // Check for new page
        if (yPosition > 250 && index < (data.recommendations?.length || 0) - 1) {
          pdf.addPage();
          yPosition = margin;
        }
      });
    }
    
    // General development guidelines
    yPosition += 15;
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GENEL GELİŞİM REHBERİ', margin, yPosition);
    yPosition += 15;
    
    const generalGuidelines = [
      'Düzenli öz-değerlendirme yapın ve gelişim alanlarınızı takip edin',
      'Mentorluk programlarına katılım sağlayın',
      'Liderlik ile ilgili kitaplar okuyun ve güncel kalın',
      'Farklı departmanlarla işbirliği fırsatları yaratın',
      'Geri bildirim alma ve verme becerilerinizi geliştirin',
      'Hedef belirleme ve takip sistemleri kullanın'
    ];
    
    generalGuidelines.forEach((guideline, index) => {
      pdf.setTextColor(16, 185, 129);
      pdf.setFontSize(12);
      pdf.text('▶', margin, yPosition);
      
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(guideline, contentWidth - 15);
      pdf.text(lines, margin + 10, yPosition);
      yPosition += lines.length * 5 + 8;
    });
    
    // Footer disclaimer
    yPosition += 20;
    pdf.setFillColor(254, 243, 199);
    pdf.rect(margin, yPosition, contentWidth, 25, 'F');
    pdf.setDrawColor(245, 158, 11);
    pdf.rect(margin, yPosition, contentWidth, 25);
    
    pdf.setTextColor(120, 53, 15);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    const disclaimer = 'Bu öneriler AI destekli analiz sonuçlarına dayanmaktadır. Kişisel gelişim planınızı oluştururken profesyonel destek almanızı ve organizasyonel hedeflerinizi göz önünde bulundurmanızı öneririz.';
    const disclaimerLines = pdf.splitTextToSize(disclaimer, contentWidth - 20);
    pdf.text(disclaimerLines, margin + 10, yPosition + 8);
  }
} 