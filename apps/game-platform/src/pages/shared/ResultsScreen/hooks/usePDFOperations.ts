import { useState, useRef } from 'react';
import { PDFImportService, PDFExportService } from '@cgames/services';
import type { ImportedData } from '@cgames/services/PDFImportService';
import type { ExportData } from '@cgames/services/PDFExportService';
import type { CompetencyScore, ResultsScreenUser } from '../types/results';
import type { SessionAnalytics } from '@cgames/services/InteractionTracker';
import type { PersonalizedRecommendations } from '@cgames/types/Recommendations';
import { getRecommendations } from '../utils/insights';

export interface UsePDFOperationsReturn {
  // Import state
  isImporting: boolean;
  importError: string | null;
  importSuccess: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  
  // Actions
  handleExportData: () => Promise<void>;
  handleImportClick: () => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  setImportError: (error: string | null) => void;
  setImportSuccess: (success: boolean) => void;
}

export const usePDFOperations = (
  user: ResultsScreenUser | null,
  scores: CompetencyScore[],
  interactionAnalytics: SessionAnalytics | null,
  personalizedRecommendations: PersonalizedRecommendations | null
): UsePDFOperationsReturn => {
  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = async () => {
    if (!user || scores.length === 0) {
      console.error('Missing required data for PDF export');
      return;
    }

    try {
      console.log('🚀 Starting PDF export...');
      
      const exportData: ExportData = {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company
        },
        scores: scores.map(score => ({
          name: score.name,
          score: score.score,
          maxScore: score.maxScore,
          abbreviation: score.abbreviation,
          fullName: score.fullName,
          category: score.category,
          description: score.description,
          color: score.color
        })),
        interactionAnalytics: interactionAnalytics || undefined,
        recommendations: getRecommendations(scores),
        personalizedRecommendations,
        exportDate: new Date().toISOString()
      };

      const pdfService = new PDFExportService();
      await pdfService.exportToPDF(exportData);
      
      console.log('✅ PDF export completed successfully');
      
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      alert(`PDF dışa aktarma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setImportError('Lütfen sadece PDF dosyası seçin.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setImportError('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      console.log('🚀 Starting PDF import...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const importService = new PDFImportService();
      const importedData: ImportedData = await importService.importFromPDF(file);
      
      console.log('✅ PDF import completed:', importedData);

      // Validate imported data
      if (!importedData.user || !importedData.scores || importedData.scores.length === 0) {
        throw new Error('İçe aktarılan PDF dosyasında geçerli test sonucu bulunamadı.');
      }

      // Store imported data in session storage for consistency
      sessionStorage.setItem('importedUser', JSON.stringify(importedData.user));
      sessionStorage.setItem('importedScores', JSON.stringify(importedData.scores));
      
      if (importedData.recommendations) {
        sessionStorage.setItem('importedRecommendations', JSON.stringify(importedData.recommendations));
      }
      
      if (importedData.interactionAnalytics) {
        sessionStorage.setItem('importedAnalytics', JSON.stringify(importedData.interactionAnalytics));
      }

      setImportSuccess(true);
      
      // Show success message for a few seconds
      setTimeout(() => {
        setImportSuccess(false);
      }, 5000);

      console.log('📦 Imported data stored in session storage');

    } catch (error) {
      console.error('❌ PDF import failed:', error);
      
      let errorMessage = 'PDF dosyası içe aktarılırken hata oluştu.';
      
      if (error instanceof Error) {
        if (error.message.includes('password') || error.message.includes('encrypted')) {
          errorMessage = 'PDF dosyası şifreli olabilir. Lütfen şifresiz bir dosya kullanın.';
        } else if (error.message.includes('format') || error.message.includes('structure')) {
          errorMessage = 'PDF dosya formatı desteklenmiyor. Lütfen geçerli bir sonuç raporu PDF\'i kullanın.';
        } else if (error.message.includes('corrupted') || error.message.includes('damaged')) {
          errorMessage = 'PDF dosyası hasarlı görünüyor. Lütfen başka bir dosya deneyin.';
        } else {
          errorMessage = `PDF içe aktarma hatası: ${error.message}`;
        }
      }
      
      setImportError(errorMessage);
      
    } finally {
      setIsImporting(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return {
    // Import state
    isImporting,
    importError,
    importSuccess,
    fileInputRef,
    
    // Actions
    handleExportData,
    handleImportClick,
    handleFileSelect,
    setImportError,
    setImportSuccess
  };
}; 