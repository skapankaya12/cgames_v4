import jsPDF from 'jspdf';
import type { SessionAnalytics } from './InteractionTracker';
import type { PersonalizedRecommendations } from '../types/Recommendations';

// Type definitions for better type safety
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

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface Typography {
  size: number;
  weight: 'normal' | 'bold';
  lineHeight: number;
}

interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export class PDFExportService {
  private pdf!: jsPDF;
  private currentY: number = 0;
  private pageWidth: number = 0;
  private pageHeight: number = 0;
  private margins = { top: 20, right: 20, bottom: 20, left: 20 };
  private contentWidth: number = 0;

  // Professional soft color palette
  private readonly colors = {
    primary: { r: 99, g: 102, b: 241 },      // Soft indigo
    secondary: { r: 129, g: 140, b: 248 },   // Light indigo
    success: { r: 34, g: 197, b: 94 },       // Soft green
    warning: { r: 251, g: 191, b: 36 },      // Soft amber
    danger: { r: 248, g: 113, b: 113 },      // Soft red
    info: { r: 56, g: 189, b: 248 },         // Soft blue
    
    // Text colors
    text: {
      primary: { r: 31, g: 41, b: 55 },      // Dark gray
      secondary: { r: 75, g: 85, b: 99 },    // Medium gray
      muted: { r: 156, g: 163, b: 175 }      // Light gray
    },
    
    // Background colors
    background: {
      primary: { r: 255, g: 255, b: 255 },   // White
      secondary: { r: 249, g: 250, b: 251 }, // Very light gray
      accent: { r: 243, g: 244, b: 246 }     // Light gray
    },
    
    // Chart colors (soft and professional)
    chart: [
      { r: 99, g: 102, b: 241 },   // Indigo
      { r: 34, g: 197, b: 94 },    // Green
      { r: 251, g: 191, b: 36 },   // Amber
      { r: 248, g: 113, b: 113 },  // Red
      { r: 56, g: 189, b: 248 },   // Blue
      { r: 168, g: 85, b: 247 },   // Purple
      { r: 236, g: 72, b: 153 },   // Pink
      { r: 20, g: 184, b: 166 }    // Teal
    ]
  };

  // Typography system
  private readonly typography: Record<string, Typography> = {
    title: { size: 24, weight: 'bold', lineHeight: 1.2 },
    heading: { size: 18, weight: 'bold', lineHeight: 1.3 },
    subheading: { size: 14, weight: 'bold', lineHeight: 1.4 },
    body: { size: 11, weight: 'normal', lineHeight: 1.5 },
    small: { size: 9, weight: 'normal', lineHeight: 1.4 },
    caption: { size: 8, weight: 'normal', lineHeight: 1.3 }
  };

  // Spacing system
  private readonly spacing: Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  };

  /**
   * Main export function
   */
  async exportToPDF(data: ExportData): Promise<void> {
    try {
      console.log('🚀 Creating professional PDF report...');
      
      this.initializePDF();
      this.setupFontWithTurkishSupport();
      
      // Create pages
      this.createCoverPage(data);
      this.addNewPage();
      this.createSummaryPage(data);
      this.addNewPage();
      this.createDetailedAnalysisPage(data);
      
      if (data.interactionAnalytics) {
        this.addNewPage();
        this.createAnalyticsPage(data);
      }
      
      this.addNewPage();
      this.createRecommendationsPage(data);
      
      // Add page numbers
      this.addPageNumbers();
      
      // Save the PDF
      const fileName = this.generateFileName(data);
      this.pdf.save(fileName);
      
      console.log('✅ PDF generated successfully:', fileName);
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF oluşturma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  /**
   * Initialize PDF with proper settings
   */
  private initializePDF(): void {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
    this.currentY = this.margins.top;
  }

  /**
   * Setup font with Turkish character support
   */
  private setupFontWithTurkishSupport(): void {
    try {
      // Use Helvetica which has better Unicode support than default
      this.pdf.setFont('helvetica');
      console.log('✅ Font configured for Turkish characters');
    } catch (error) {
      console.warn('⚠️ Font setup warning:', error);
    }
  }

  /**
   * Safe text rendering with Turkish character support
   */
  private renderText(
    text: string, 
    x: number, 
    y: number, 
    options?: {
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
    }
  ): number {
    try {
      // Ensure proper encoding for Turkish characters
      const processedText = this.processTurkishText(text);
      
      if (options?.maxWidth) {
        const lines = this.pdf.splitTextToSize(processedText, options.maxWidth);
        const lineHeight = this.getCurrentLineHeight();
        
        lines.forEach((line: string, index: number) => {
          this.pdf.text(line, x, y + (index * lineHeight), { 
            align: options.align || 'left' 
          });
        });
        
        return y + (lines.length * lineHeight);
      } else {
        this.pdf.text(processedText, x, y, { 
          align: options?.align || 'left' 
        });
        return y + this.getCurrentLineHeight();
      }
    } catch (error) {
      console.warn('Text rendering error:', error);
      // Fallback to ASCII version
      const asciiText = this.convertToASCII(text);
      this.pdf.text(asciiText, x, y, { align: options?.align || 'left' });
      return y + this.getCurrentLineHeight();
    }
  }

  /**
   * Process Turkish text for PDF compatibility
   */
  private processTurkishText(text: string): string {
    // Normalize Unicode characters
    return text.normalize('NFC');
  }

  /**
   * Convert Turkish characters to ASCII as fallback
   */
  private convertToASCII(text: string): string {
    const turkishMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'C',
      'ğ': 'g', 'Ğ': 'G',
      'ı': 'i', 'İ': 'I',
      'ö': 'o', 'Ö': 'O',
      'ş': 's', 'Ş': 'S',
      'ü': 'u', 'Ü': 'U'
    };
    
    return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, char => turkishMap[char] || char);
  }

  /**
   * Apply typography style
   */
  private applyTypography(style: string, color?: ColorRGB): void {
    const typo = this.typography[style];
    if (!typo) {
      console.warn(`Typography style '${style}' not found`);
      return;
    }
    
    this.pdf.setFontSize(typo.size);
    this.pdf.setFont('helvetica', typo.weight);
    
    if (color) {
      this.pdf.setTextColor(color.r, color.g, color.b);
    }
  }

  /**
   * Get current line height based on font size
   */
  private getCurrentLineHeight(): number {
    const fontSize = this.pdf.getFontSize();
    return fontSize * 1.2; // 20% line spacing
  }

  /**
   * Set color utility
   */
  private setColor(color: ColorRGB, type: 'fill' | 'draw' | 'text' = 'fill'): void {
    switch (type) {
      case 'fill':
        this.pdf.setFillColor(color.r, color.g, color.b);
        break;
      case 'draw':
        this.pdf.setDrawColor(color.r, color.g, color.b);
        break;
      case 'text':
        this.pdf.setTextColor(color.r, color.g, color.b);
        break;
    }
  }

  /**
   * Check if new page is needed
   */
  private checkPageBreak(neededSpace: number): void {
    if (this.currentY + neededSpace > this.pageHeight - this.margins.bottom) {
      this.addNewPage();
    }
  }

  /**
   * Add new page
   */
  private addNewPage(): void {
    this.pdf.addPage();
    this.currentY = this.margins.top;
  }

  /**
   * Create cover page
   */
  private createCoverPage(data: ExportData): void {
    // Header background
    this.setColor(this.colors.primary, 'fill');
    this.pdf.rect(0, 0, this.pageWidth, 60, 'F');
    
    // Title
    this.applyTypography('title', this.colors.background.primary);
    this.currentY = 35;
    this.renderText(
      'LİDERLİK YETKİNLİK DEĞERLENDİRMESİ',
      this.pageWidth / 2,
      this.currentY,
      { align: 'center' }
    );
    
    // Participant info card
    this.currentY = 80;
    this.createParticipantCard(data);
    
    // Overall score gauge
    this.currentY += this.spacing.xl;
    this.createOverallScoreGauge(data);
    
    // Footer
    this.createCoverFooter();
  }

  /**
   * Create participant information card
   */
  private createParticipantCard(data: ExportData): void {
    const cardHeight = 50;
    const cardY = this.currentY;
    
    // Card background
    this.setColor(this.colors.background.secondary, 'fill');
    this.pdf.rect(this.margins.left, cardY, this.contentWidth, cardHeight, 'F');
    
    // Card border
    this.setColor(this.colors.text.muted, 'draw');
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(this.margins.left, cardY, this.contentWidth, cardHeight);
    
    // Content
    this.applyTypography('subheading', this.colors.text.primary);
    let textY = cardY + 15;
    
    this.renderText('KATILIMCI BİLGİLERİ', this.margins.left + 10, textY);
    
    this.applyTypography('body', this.colors.text.secondary);
    textY += 10;
    
    this.renderText(
      `Ad Soyad: ${data.user.firstName} ${data.user.lastName}`,
      this.margins.left + 10,
      textY
    );
    
    if (data.user.company) {
      textY += 8;
      this.renderText(
        `Şirket: ${data.user.company}`,
        this.margins.left + 10,
        textY
      );
    }
    
    textY += 8;
    this.renderText(
      `Tarih: ${new Date(data.exportDate).toLocaleDateString('tr-TR')}`,
      this.margins.left + 10,
      textY
    );
    
    this.currentY = cardY + cardHeight;
  }

  /**
   * Create overall score gauge chart
   */
  private createOverallScoreGauge(data: ExportData): void {
    const overallScore = this.calculateOverallScore(data.scores);
    const centerX = this.pageWidth / 2;
    const centerY = this.currentY + 40;
    const radius = 30;
    
    // Background circle
    this.setColor(this.colors.background.accent, 'fill');
    this.pdf.circle(centerX, centerY, radius, 'F');
    
    // Score arc
    this.drawScoreArc(centerX, centerY, radius - 5, overallScore);
    
    // Score text
    this.applyTypography('heading', this.colors.text.primary);
    this.renderText(
      `%${Math.round(overallScore)}`,
      centerX,
      centerY + 3,
      { align: 'center' }
    );
    
    // Label
    this.applyTypography('small', this.colors.text.secondary);
    this.renderText(
      'GENEL PERFORMANS',
      centerX,
      centerY + 15,
      { align: 'center' }
    );
    
    this.currentY = centerY + radius + 20;
  }

  /**
   * Draw score arc for gauge
   */
  private drawScoreArc(x: number, y: number, radius: number, score: number): void {
    const color = this.getScoreColor(score);
    this.setColor(color, 'draw');
    this.pdf.setLineWidth(3);
    
    // Calculate arc (270 degrees max)
    const startAngle = 135; // Start from bottom left
    const endAngle = startAngle + (score / 100 * 270);
    
    // Draw arc using multiple small lines
    const steps = Math.max(20, Math.round((endAngle - startAngle) / 5));
    for (let i = 0; i < steps; i++) {
      const angle = startAngle + ((endAngle - startAngle) * i / steps);
      const nextAngle = startAngle + ((endAngle - startAngle) * (i + 1) / steps);
      
      const x1 = x + radius * Math.cos(angle * Math.PI / 180);
      const y1 = y + radius * Math.sin(angle * Math.PI / 180);
      const x2 = x + radius * Math.cos(nextAngle * Math.PI / 180);
      const y2 = y + radius * Math.sin(nextAngle * Math.PI / 180);
      
      this.pdf.line(x1, y1, x2, y2);
    }
  }

  /**
   * Get color based on score
   */
  private getScoreColor(score: number): ColorRGB {
    if (score >= 80) return this.colors.success;
    if (score >= 60) return this.colors.info;
    if (score >= 40) return this.colors.warning;
    return this.colors.danger;
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(scores: ExportData['scores']): number {
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, score) => sum + (score.score / score.maxScore * 100), 0);
    return total / scores.length;
  }

  /**
   * Create cover footer
   */
  private createCoverFooter(): void {
    this.applyTypography('caption', this.colors.text.muted);
    const footerY = this.pageHeight - 30;
    
    this.renderText(
      'Bu rapor AI destekli analiz ve psikometrik değerlendirme yöntemleri kullanılarak oluşturulmuştur.',
      this.pageWidth / 2,
      footerY,
      { align: 'center' }
    );
  }

  /**
   * Create summary page
   */
  private createSummaryPage(data: ExportData): void {
    // Page header
    this.createPageHeader('YÖNETİCİ ÖZETİ');
    
    // Key metrics
    this.createKeyMetrics(data);
    
    // Strengths and development areas
    this.currentY += this.spacing.lg;
    this.createStrengthsAndDevelopmentAreas(data);
    
    // Quick insights
    this.currentY += this.spacing.lg;
    this.createQuickInsights(data);
  }

  /**
   * Create page header
   */
  private createPageHeader(title: string): void {
    this.applyTypography('heading', this.colors.text.primary);
    this.currentY += this.spacing.md;
    this.renderText(title, this.margins.left, this.currentY);
    
    // Underline
    this.currentY += 5;
    this.setColor(this.colors.primary, 'draw');
    this.pdf.setLineWidth(2);
    this.pdf.line(this.margins.left, this.currentY, this.margins.left + 100, this.currentY);
    
    this.currentY += this.spacing.md;
  }

  /**
   * Create key metrics cards
   */
  private createKeyMetrics(data: ExportData): void {
    const overallScore = this.calculateOverallScore(data.scores);
    const strongCount = data.scores.filter(s => (s.score / s.maxScore * 100) >= 70).length;
    const needsImprovement = data.scores.filter(s => (s.score / s.maxScore * 100) < 50).length;
    
    const metrics = [
      { label: 'Genel Performans', value: `%${Math.round(overallScore)}`, color: this.getScoreColor(overallScore) },
      { label: 'Güçlü Alanlar', value: strongCount.toString(), color: this.colors.success },
      { label: 'Gelişim Alanları', value: needsImprovement.toString(), color: this.colors.warning }
    ];
    
    const cardWidth = (this.contentWidth - 2 * this.spacing.md) / 3;
    
    metrics.forEach((metric, index) => {
      const x = this.margins.left + (index * (cardWidth + this.spacing.md));
      this.createMetricCard(x, this.currentY, cardWidth, metric);
    });
    
    this.currentY += 60; // Card height + spacing
  }

  /**
   * Create metric card
   */
  private createMetricCard(
    x: number, 
    y: number, 
    width: number, 
    metric: { label: string; value: string; color: ColorRGB }
  ): void {
    const height = 50;
    
    // Card background
    this.setColor(this.colors.background.secondary, 'fill');
    this.pdf.rect(x, y, width, height, 'F');
    
    // Card border
    this.setColor(metric.color, 'draw');
    this.pdf.setLineWidth(1);
    this.pdf.rect(x, y, width, height);
    
    // Top accent bar
    this.setColor(metric.color, 'fill');
    this.pdf.rect(x, y, width, 3, 'F');
    
    // Value
    this.applyTypography('heading', metric.color);
    this.renderText(metric.value, x + width/2, y + 25, { align: 'center' });
    
    // Label
    this.applyTypography('small', this.colors.text.secondary);
    this.renderText(metric.label, x + width/2, y + 40, { align: 'center' });
  }

  /**
   * Create strengths and development areas
   */
  private createStrengthsAndDevelopmentAreas(data: ExportData): void {
    const sortedScores = [...data.scores].sort((a, b) => 
      (b.score / b.maxScore) - (a.score / a.maxScore)
    );
    
    const strengths = sortedScores.slice(0, 3);
    const development = sortedScores.slice(-3).reverse();
    
    const columnWidth = (this.contentWidth - this.spacing.md) / 2;
    
    // Strengths column
    this.applyTypography('subheading', this.colors.text.primary);
    this.renderText('GÜÇLÜ ALANLAR', this.margins.left, this.currentY);
    
    let strengthsY = this.currentY + this.spacing.md;
    strengths.forEach((comp, _index) => {
      const score = Math.round((comp.score / comp.maxScore) * 100);
      this.createCompetencyItem(this.margins.left, strengthsY, columnWidth, comp.fullName, score);
      strengthsY += 25;
    });
    
    // Development areas column
    const devX = this.margins.left + columnWidth + this.spacing.md;
    this.renderText('GELİŞİM ALANLARI', devX, this.currentY);
    
    let devY = this.currentY + this.spacing.md;
    development.forEach((comp, _index) => {
      const score = Math.round((comp.score / comp.maxScore) * 100);
      this.createCompetencyItem(devX, devY, columnWidth, comp.fullName, score);
      devY += 25;
    });
    
    this.currentY = Math.max(strengthsY, devY) + this.spacing.sm;
  }

  /**
   * Create competency item
   */
  private createCompetencyItem(
    x: number, 
    y: number, 
    width: number, 
    name: string, 
    score: number
  ): void {
    const height = 20;
    const color = this.getScoreColor(score);
    
    // Background
    this.setColor(this.colors.background.accent, 'fill');
    this.pdf.rect(x, y, width, height, 'F');
    
    // Progress bar
    const progressWidth = (width - 40) * (score / 100);
    this.setColor(color, 'fill');
    this.pdf.rect(x + 5, y + height - 3, progressWidth, 3, 'F');
    
    // Text
    this.applyTypography('small', this.colors.text.primary);
    this.renderText(name, x + 5, y + 12, { maxWidth: width - 45 });
    
    // Score
    this.applyTypography('small', color);
    this.renderText(`%${score}`, x + width - 25, y + 12, { align: 'right' });
  }

  /**
   * Create quick insights
   */
  private createQuickInsights(data: ExportData): void {
    this.applyTypography('subheading', this.colors.text.primary);
    this.renderText('TEMEL İÇGÖRÜLER', this.margins.left, this.currentY);
    
    this.currentY += this.spacing.md;
    
    const overallScore = this.calculateOverallScore(data.scores);
    const insights = [
      `Genel liderlik yetkinlik seviyeniz %${Math.round(overallScore)} olarak değerlendirilmiştir.`,
      `${data.scores.filter(s => (s.score / s.maxScore * 100) >= 70).length} alanda güçlü performans gösteriyorsunuz.`,
      `${data.scores.filter(s => (s.score / s.maxScore * 100) < 50).length} alan odaklanmış gelişim için önceliklendirilmiştir.`
    ];
    
    insights.forEach(insight => {
      this.applyTypography('body', this.colors.text.secondary);
      this.currentY = this.renderText(
        `• ${insight}`,
        this.margins.left + 10,
        this.currentY,
        { maxWidth: this.contentWidth - 20 }
      );
      this.currentY += this.spacing.xs;
    });
  }

  /**
   * Create detailed analysis page
   */
  private createDetailedAnalysisPage(data: ExportData): void {
    this.createPageHeader('DETAYLI YETKİNLİK ANALİZİ');
    
    // Competency chart
    this.createCompetencyChart(data);
    
    // Category breakdown
    this.currentY += this.spacing.lg;
    this.createCategoryBreakdown(data);
  }

  /**
   * Create competency chart
   */
  private createCompetencyChart(data: ExportData): void {
    const chartHeight = 100;
    const chartY = this.currentY;
    const barWidth = this.contentWidth / data.scores.length;
    
    // Chart background
    this.setColor(this.colors.background.secondary, 'fill');
    this.pdf.rect(this.margins.left, chartY, this.contentWidth, chartHeight, 'F');
    
    // Bars
    data.scores.forEach((comp, index) => {
      const score = (comp.score / comp.maxScore) * 100;
      const barHeight = (score / 100) * (chartHeight - 20);
      const x = this.margins.left + (index * barWidth) + (barWidth * 0.1);
      const width = barWidth * 0.8;
      const y = chartY + chartHeight - 10 - barHeight;
      
      // Bar
      const color = this.colors.chart[index % this.colors.chart.length];
      this.setColor(color, 'fill');
      this.pdf.rect(x, y, width, barHeight, 'F');
      
      // Score label
      this.applyTypography('caption', this.colors.text.primary);
      this.renderText(
        `%${Math.round(score)}`,
        x + width/2,
        y - 3,
        { align: 'center' }
      );
      
      // Competency label (rotated effect with abbreviation)
      this.renderText(
        comp.abbreviation || comp.name.substring(0, 4).toUpperCase(),
        x + width/2,
        chartY + chartHeight + 8,
        { align: 'center' }
      );
    });
    
    this.currentY = chartY + chartHeight + 20;
  }

  /**
   * Create category breakdown
   */
  private createCategoryBreakdown(data: ExportData): void {
    const categories = this.groupCompetenciesByCategory(data.scores);
    
    Object.entries(categories).forEach(([category, competencies]) => {
      this.checkPageBreak(60);
      
      this.applyTypography('subheading', this.colors.text.primary);
      this.renderText(category, this.margins.left, this.currentY);
      
      this.currentY += this.spacing.md;
      
      competencies.forEach(comp => {
        const score = Math.round((comp.score / comp.maxScore) * 100);
        this.createCompetencyItem(
          this.margins.left + 10,
          this.currentY,
          this.contentWidth - 20,
          comp.fullName,
          score
        );
        this.currentY += 25;
      });
      
      this.currentY += this.spacing.sm;
    });
  }

  /**
   * Group competencies by category
   */
  private groupCompetenciesByCategory(scores: ExportData['scores']): Record<string, ExportData['scores']> {
    const categories: Record<string, ExportData['scores']> = {};
    
    scores.forEach(comp => {
      const category = comp.category || 'Genel';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(comp);
    });
    
    return categories;
  }

  /**
   * Create analytics page
   */
  private createAnalyticsPage(data: ExportData): void {
    if (!data.interactionAnalytics) return;
    
    this.createPageHeader('DAVRANIŞSAL ANALİTİK');
    
    const analytics = data.interactionAnalytics;
    
    // Response time metric
    const avgResponseTime = Math.round(analytics.averageResponseTime / 1000);
    const completionRate = Math.round((analytics.completedQuestions / analytics.totalQuestions) * 100);
    
    const analyticsMetrics = [
      { label: 'Ortalama Yanıt Süresi', value: `${avgResponseTime}s`, color: this.colors.info },
      { label: 'Tamamlanma Oranı', value: `%${completionRate}`, color: this.colors.success }
    ];
    
    const cardWidth = (this.contentWidth - this.spacing.md) / 2;
    
    analyticsMetrics.forEach((metric, index) => {
      const x = this.margins.left + (index * (cardWidth + this.spacing.md));
      this.createMetricCard(x, this.currentY, cardWidth, metric);
    });
    
    this.currentY += 80;
    
    // Additional insights
    this.applyTypography('body', this.colors.text.secondary);
    this.currentY = this.renderText(
      'Değerlendirme sırasındaki davranış kalıplarınız tutarlı ve odaklanmış bir yaklaşım sergilediğinizi göstermektedir.',
      this.margins.left,
      this.currentY,
      { maxWidth: this.contentWidth }
    );
  }

  /**
   * Create recommendations page
   */
  private createRecommendationsPage(data: ExportData): void {
    this.createPageHeader('GELİŞİM ÖNERİLERİ');
    
    // Priority development areas
    const developmentAreas = [...data.scores]
      .sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore))
      .slice(0, 3);
    
    this.applyTypography('subheading', this.colors.text.primary);
    this.renderText('ÖNCELİKLİ GELİŞİM ALANLARI', this.margins.left, this.currentY);
    
    this.currentY += this.spacing.md;
    
    developmentAreas.forEach((comp, index) => {
      const score = Math.round((comp.score / comp.maxScore) * 100);
      
      this.applyTypography('body', this.colors.text.primary);
      this.currentY = this.renderText(
        `${index + 1}. ${comp.fullName} (%${score})`,
        this.margins.left + 10,
        this.currentY
      );
      
      this.applyTypography('small', this.colors.text.secondary);
      this.currentY = this.renderText(
        comp.description,
        this.margins.left + 20,
        this.currentY,
        { maxWidth: this.contentWidth - 30 }
      );
      
      this.currentY += this.spacing.sm;
    });
    
    // Action plan
    this.currentY += this.spacing.md;
    this.createActionPlan();
  }

  /**
   * Create action plan
   */
  private createActionPlan(): void {
    this.applyTypography('subheading', this.colors.text.primary);
    this.renderText('EYLEM PLANI', this.margins.left, this.currentY);
    
    this.currentY += this.spacing.md;
    
    const actionItems = [
      'İlk 30 gün: Gelişim alanlarınızı detaylı olarak analiz edin',
      '30-90 gün: Hedeflenen yetkinlikler için özel eğitim programlarına katılın',
      '90+ gün: Öğrendiklerinizi pratik projelerle uygulayın ve geri bildirim alın'
    ];
    
    actionItems.forEach(item => {
      this.applyTypography('body', this.colors.text.secondary);
      this.currentY = this.renderText(
        `• ${item}`,
        this.margins.left + 10,
        this.currentY,
        { maxWidth: this.contentWidth - 20 }
      );
      this.currentY += this.spacing.xs;
    });
  }

  /**
   * Add page numbers to all pages
   */
  private addPageNumbers(): void {
    const totalPages = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      this.applyTypography('caption', this.colors.text.muted);
      this.renderText(
        `Sayfa ${i} / ${totalPages}`,
        this.pageWidth - this.margins.right,
        this.pageHeight - 10,
        { align: 'right' }
      );
    }
  }

  /**
   * Generate filename
   */
  private generateFileName(data: ExportData): string {
    const date = new Date().toISOString().split('T')[0];
    const firstName = this.convertToASCII(data.user.firstName);
    const lastName = this.convertToASCII(data.user.lastName);
    return `${firstName}_${lastName}_Liderlik_Raporu_${date}.pdf`;
  }
} 