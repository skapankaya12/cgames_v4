/**
 * Google Sheets Integration Service
 * Sends assessment data to Google Sheets via Google Apps Script
 */

class GoogleSheetsService {
  constructor() {
    this.scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || '';
    this.enabled = !!this.scriptUrl;
  }

  /**
   * Send assessment data to Google Sheets
   * @param {Object} assessmentData - The assessment data to send
   * @returns {Promise<boolean>} - Success status
   */
  async sendAssessmentData(assessmentData) {
    if (!this.enabled) {
      console.log('📊 [Google Sheets] Service disabled - no script URL configured');
      return false;
    }

    try {
      console.log('📊 [Google Sheets] Sending assessment data to Google Sheets');
      console.log('  - Assessment Type:', assessmentData.assessmentType);
      console.log('  - Candidate:', assessmentData.candidateEmail);
      console.log('  - Answers Count:', Object.keys(assessmentData.answers || {}).length);

      // Send to Google Apps Script - send data directly as JSON body
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
        redirect: 'follow' // Follow redirects
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [Google Sheets] Assessment data sent successfully');
        return true;
      } else {
        console.error('❌ [Google Sheets] Script returned error:', result.error);
        return false;
      }

    } catch (error) {
      console.error('❌ [Google Sheets] Failed to send assessment data:', error);
      return false;
    }
  }

  /**
   * Format assessment data for Google Sheets
   * @param {Object} submissionData - Original submission data
   * @param {Object} inviteData - Invite data from Firebase
   * @param {Object} calculatedScores - Calculated scores
   * @returns {Object} - Formatted data for Google Sheets
   */
  formatAssessmentData(submissionData, inviteData, calculatedScores) {
    return {
      // Basic info
      candidateEmail: submissionData.candidateEmail || inviteData.candidateEmail,
      projectId: inviteData.projectId,
      token: submissionData.token,
      
      // Assessment info
      assessmentType: submissionData.assessmentType || inviteData.selectedGame || 'space-mission',
      assessmentName: submissionData.assessmentName || this.getAssessmentDisplayName(submissionData.assessmentType),
      
      // Raw answers
      answers: submissionData.answers || submissionData.results?.answers || {},
      
      // Scores
      scores: submissionData.scores || calculatedScores.competencyScores || {},
      rawScore: calculatedScores.overallScore,
      scorePercentage: Math.round(calculatedScores.scorePercentage),
      
      // Metadata
      completionTime: submissionData.completionTime,
      totalQuestions: calculatedScores.totalQuestions,
      completedQuestions: submissionData.completedQuestions || calculatedScores.totalQuestions,
      candidateInfo: submissionData.candidateInfo || {},
      
      // Timestamps
      completedAt: submissionData.completedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      
      // Additional metadata
      metadata: {
        inviteId: inviteData.id,
        apiVersion: '2.0.0',
        source: 'cgames_v4_api'
      }
    };
  }

  /**
   * Get display name for assessment type
   * @param {string} assessmentType 
   * @returns {string}
   */
  getAssessmentDisplayName(assessmentType) {
    const displayNames = {
      'space-mission': 'Space Mission Leadership Assessment',
      'takim-degerlendirme': 'Takım Değerlendirme Anketi',
      'calisan-bagliligi': 'Çalışan Bağlılığı Anketi',
      'yonetici-degerlendirme': 'Yönetici Değerlendirme Anketi'
    };
    
    return displayNames[assessmentType] || 'Assessment';
  }

  /**
   * Test the Google Sheets connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    if (!this.enabled) {
      console.log('📊 [Google Sheets] Service disabled');
      return false;
    }

    try {
      const testData = {
        assessmentType: 'test',
        candidateEmail: 'test@example.com',
        answers: { '1': 'test_answer' },
        scores: { 'test_score': 100 },
        projectId: 'test-project',
        token: 'test-token'
      };

      console.log('📊 [Google Sheets] Testing connection...');
      const result = await this.sendAssessmentData(testData);
      
      if (result) {
        console.log('✅ [Google Sheets] Connection test successful');
      } else {
        console.log('❌ [Google Sheets] Connection test failed');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ [Google Sheets] Connection test error:', error);
      return false;
    }
  }
}

module.exports = { GoogleSheetsService };
