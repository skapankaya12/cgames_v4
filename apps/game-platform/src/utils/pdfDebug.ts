import * as pdfjsLib from 'pdfjs-dist';

/**
 * PDF.js Debug Utilities
 * Helps diagnose and fix PDF processing issues
 */
export class PDFDebugUtils {
  /**
   * Check if PDF.js worker is properly configured
   */
  static checkWorkerConfiguration(): { isConfigured: boolean; workerSrc: string; issues: string[] } {
    const issues: string[] = [];
    const workerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
    
    if (!workerSrc) {
      issues.push('PDF.js worker source not configured');
    }
    
    if (workerSrc && workerSrc.includes('3.11.174')) {
      issues.push('PDF.js worker version mismatch - using old version 3.11.174');
    }
    
    return {
      isConfigured: !!workerSrc,
      workerSrc: workerSrc || 'Not configured',
      issues
    };
  }

  /**
   * Test PDF processing with a minimal test
   */
  static async testPDFProcessing(): Promise<{ success: boolean; error?: string }> {
    try {
      // Create a minimal PDF for testing
      const testPdf = new Uint8Array([
        0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34
      ]); // "%PDF-1.4" header
      
      // This will fail but will help us diagnose worker issues
      await pdfjsLib.getDocument({ data: testPdf }).promise;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get PDF.js version information
   */
  static getVersionInfo(): { pdfjsVersion: string; build: string } {
    return {
      pdfjsVersion: pdfjsLib.version || 'Unknown',
      build: pdfjsLib.build || 'Unknown'
    };
  }

  /**
   * Provide user-friendly error messages based on common PDF issues
   */
  static getUserFriendlyError(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('version') && (message.includes('api') || message.includes('worker'))) {
      return 'PDF işleme sorunu: Sayfa yenilenerek tekrar deneyin.';
    }
    
    if (message.includes('worker') && message.includes('fetch')) {
      return 'PDF işleyici dosyası bulunamadı. İnternet bağlantınızı kontrol edin.';
    }
    
    if (message.includes('worker')) {
      return 'PDF işleyici yüklenemedi. Sayfa yenilenerek tekrar deneyin.';
    }
    
    if (message.includes('encrypted')) {
      return 'Bu PDF dosyası şifrelidir. Şifresiz bir PDF dosyası yükleyin.';
    }
    
    if (message.includes('corrupted') || message.includes('invalid')) {
      return 'PDF dosyası bozuk veya geçersiz. Başka bir PDF dosyası deneyin.';
    }
    
    if (message.includes('size') || message.includes('large')) {
      return 'PDF dosyası çok büyük. Daha küçük bir dosya deneyin (maksimum 10MB).';
    }
    
    return `PDF yükleme hatası: ${error.message}`;
  }

  /**
   * Log debug information to console
   */
  static logDebugInfo(): void {
    console.group('📋 PDF.js Debug Information');
    
    const workerInfo = this.checkWorkerConfiguration();
    console.log('Worker Configuration:', workerInfo);
    
    const versionInfo = this.getVersionInfo();
    console.log('Version Information:', versionInfo);
    
    if (workerInfo.issues.length > 0) {
      console.warn('⚠️ Issues found:', workerInfo.issues);
    }
    
    console.groupEnd();
  }
} 