import jsPDF from 'jspdf';
import type { SessionAnalytics } from './InteractionTracker';

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
  exportDate: string;
}

export class PDFExportService {
  /**
   * Export user results as a professional PDF report
   */
  async exportToPDF(data: ExportData): Promise<void> {
    try {
      console.log('📄 Starting PDF export process...');
      
      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Set up fonts and colors
      pdf.setFont('helvetica');
      
      // Page 1: Cover Page
      this.createCoverPage(pdf, data, pageWidth, pageHeight, margin);
      
      // Page 2: Results Summary
      pdf.addPage();
      this.createResultsSummary(pdf, data, pageWidth, margin, contentWidth);
      
      // Page 3: Detailed Competency Analysis
      pdf.addPage();
      this.createDetailedAnalysis(pdf, data, margin, contentWidth);
      
      // Page 4: Recommendations (if available)
      if (data.recommendations && data.recommendations.length > 0) {
        pdf.addPage();
        this.createRecommendationsPage(pdf, data, margin, contentWidth);
      }
      
      // Generate filename
      const fileName = `${data.user.firstName}_${data.user.lastName}_Sonuclar_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      
      console.log('✅ PDF export completed successfully:', fileName);
      
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create cover page
   */
  private createCoverPage(pdf: jsPDF, data: ExportData, pageWidth: number, pageHeight: number, margin: number): void {
    // Header background
    pdf.setFillColor(30, 41, 59);
    pdf.rect(0, 0, pageWidth, 80, 'F');
    
    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Liderlik Yetkinlik Raporu', pageWidth / 2, 35, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Kişiselleştirilmiş Gelişim Analizi', pageWidth / 2, 55, { align: 'center' });
    
    // User information section
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Katılımcı Bilgileri', margin, 110);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Ad Soyad: ${data.user.firstName} ${data.user.lastName}`, margin, 130);
    
    if (data.user.company) {
      pdf.text(`Şirket: ${data.user.company}`, margin, 145);
    }
    
    pdf.text(`Rapor Tarihi: ${new Date(data.exportDate).toLocaleDateString('tr-TR')}`, margin, 160);
    
    // Overall score circle
    const overallScore = Math.round(
      data.scores.reduce((sum, comp) => sum + (comp.score / comp.maxScore) * 100, 0) / data.scores.length
    );
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Genel Performans', pageWidth / 2, 200, { align: 'center' });
    
    // Draw circle for overall score
    const centerX = pageWidth / 2;
    const centerY = 230;
    const radius = 25;
    
    // Circle background
    pdf.setFillColor(240, 240, 240);
    pdf.circle(centerX, centerY, radius, 'F');
    
    // Score color based on performance
    let scoreColor = [255, 107, 107]; // Red
    if (overallScore >= 80) scoreColor = [0, 255, 136]; // Green
    else if (overallScore >= 60) scoreColor = [0, 191, 255]; // Blue
    else if (overallScore >= 40) scoreColor = [255, 165, 0]; // Orange
    
    pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`%${overallScore}`, centerX, centerY + 5, { align: 'center' });
    
    // Performance level
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    let level = 'Gelişim Alanı';
    if (overallScore >= 80) level = 'Mükemmel';
    else if (overallScore >= 60) level = 'İyi';
    else if (overallScore >= 40) level = 'Orta';
    
    pdf.text(level, centerX, centerY + 35, { align: 'center' });
    
    // Footer
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.text('Bu rapor AI destekli analiz ile oluşturulmuştur.', pageWidth / 2, pageHeight - 20, { align: 'center' });
  }

  /**
   * Create results summary page
   */
  private createResultsSummary(pdf: jsPDF, data: ExportData, pageWidth: number, margin: number, contentWidth: number): void {
    let yPosition = margin;
    
    // Page title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Yetkinlik Skorları', margin, yPosition);
    yPosition += 20;
    
    // Competency scores
    data.scores.forEach((comp, index) => {
      const percentage = (comp.score / comp.maxScore) * 100;
      
      // Competency name
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(comp.fullName, margin, yPosition);
      
      // Score
      pdf.setFont('helvetica', 'normal');
      pdf.text(`%${percentage.toFixed(0)}`, pageWidth - margin - 30, yPosition);
      
      // Progress bar background
      const barY = yPosition + 5;
      const barHeight = 6;
      const barWidth = contentWidth - 50;
      
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, barY, barWidth, barHeight, 'F');
      
      // Progress bar fill
      const fillWidth = (barWidth * percentage) / 100;
      let fillColor = [255, 107, 107]; // Red
      if (percentage >= 80) fillColor = [0, 255, 136]; // Green
      else if (percentage >= 60) fillColor = [0, 191, 255]; // Blue
      else if (percentage >= 40) fillColor = [255, 165, 0]; // Orange
      
      pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      pdf.rect(margin, barY, fillWidth, barHeight, 'F');
      
      yPosition += 25;
      
      // Add new page if needed
      if (yPosition > 250 && index < data.scores.length - 1) {
        pdf.addPage();
        yPosition = margin;
      }
    });
    
    // Behavioral analytics section (if available)
    if (data.interactionAnalytics && yPosition < 200) {
      yPosition += 20;
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Davranış Analizi', margin, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      if (data.interactionAnalytics.averageResponseTime) {
        const avgTime = Math.round(data.interactionAnalytics.averageResponseTime / 1000);
        pdf.text(`• Ortalama Yanıt Süresi: ${avgTime} saniye`, margin, yPosition);
        yPosition += 12;
      }
      
      if (data.interactionAnalytics.totalAnswerChanges !== undefined) {
        pdf.text(`• Cevap Değişikliği: ${data.interactionAnalytics.totalAnswerChanges} kez`, margin, yPosition);
        yPosition += 12;
      }
      
      if (data.interactionAnalytics.totalBackNavigations !== undefined) {
        pdf.text(`• Geri Dönüş: ${data.interactionAnalytics.totalBackNavigations} kez`, margin, yPosition);
        yPosition += 12;
      }
    }
  }

  /**
   * Create detailed analysis page
   */
  private createDetailedAnalysis(pdf: jsPDF, data: ExportData, margin: number, contentWidth: number): void {
    let yPosition = margin;
    
    // Page title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detaylı Yetkinlik Analizi', margin, yPosition);
    yPosition += 20;
    
    // Group competencies by category
    const categories: { [key: string]: typeof data.scores } = {};
    data.scores.forEach(comp => {
      if (!categories[comp.category]) {
        categories[comp.category] = [];
      }
      categories[comp.category].push(comp);
    });
    
    // Display each category
    Object.entries(categories).forEach(([category, competencies]) => {
      // Category header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text(category, margin, yPosition);
      yPosition += 15;
      
      // Competencies in this category
      competencies.forEach(comp => {
        const percentage = (comp.score / comp.maxScore) * 100;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${comp.fullName} (%${percentage.toFixed(0)})`, margin + 5, yPosition);
        yPosition += 10;
        
        // Description
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        
        const description = comp.description || `${comp.fullName} yetkinliği analizi`;
        const lines = pdf.splitTextToSize(description, contentWidth - 10);
        pdf.text(lines, margin + 5, yPosition);
        yPosition += lines.length * 5 + 5;
        
        // Insight based on score
        let insight = '';
        if (percentage >= 80) {
          insight = 'Mükemmel performans! Bu alanda liderlik yapabilecek seviyedesiniz.';
        } else if (percentage >= 60) {
          insight = 'İyi performans. Küçük iyileştirmelerle daha da güçlenebilirsiniz.';
        } else if (percentage >= 40) {
          insight = 'Orta seviye performans. Odaklanarak gelişim sağlayabilirsiniz.';
        } else {
          insight = 'Gelişim alanı. Temel becerileri güçlendirmeye odaklanın.';
        }
        
        pdf.setTextColor(0, 100, 200);
        const insightLines = pdf.splitTextToSize(insight, contentWidth - 10);
        pdf.text(insightLines, margin + 5, yPosition);
        yPosition += insightLines.length * 5 + 15;
        
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = margin;
        }
      });
      
      yPosition += 10;
    });
  }

  /**
   * Create recommendations page
   */
  private createRecommendationsPage(pdf: jsPDF, data: ExportData, margin: number, contentWidth: number): void {
    let yPosition = margin;
    
    // Page title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Gelişim Önerileri', margin, yPosition);
    yPosition += 20;
    
    // Introduction
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    const intro = 'Analiz sonuçlarınıza göre kişiselleştirilmiş gelişim önerileri:';
    pdf.text(intro, margin, yPosition);
    yPosition += 20;
    
    // Recommendations
    if (data.recommendations && data.recommendations.length > 0) {
      data.recommendations.forEach((recommendation, index) => {
        // Bullet point
        pdf.setTextColor(0, 100, 200);
        pdf.setFontSize(12);
        pdf.text('•', margin, yPosition);
        
        // Recommendation text
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const lines = pdf.splitTextToSize(recommendation, contentWidth - 10);
        pdf.text(lines, margin + 8, yPosition);
        yPosition += lines.length * 6 + 8;
        
        // Check if we need a new page
        if (yPosition > 250 && index < (data.recommendations?.length || 0) - 1) {
          pdf.addPage();
          yPosition = margin;
        }
      });
    } else {
      // No recommendations available message
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Şu anda özel gelişim önerisi bulunmamaktadır.', margin, yPosition);
      yPosition += 15;
    }
    
    // Footer note
    yPosition += 20;
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    const footerNote = 'Bu öneriler AI destekli analiz sonuçlarına dayanmaktadır. Kişisel gelişim planınızı oluştururken profesyonel destek almanızı öneririz.';
    const footerLines = pdf.splitTextToSize(footerNote, contentWidth);
    pdf.text(footerLines, margin, yPosition);
  }
} 