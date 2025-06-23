import * as React from 'react';
import type { PersonalizedRecommendations, RecommendationItem, DimensionScore } from '@cgames/types/Recommendations';
import type { CVData } from '@cgames/types/CVTypes';
import { CVTextExtractionService } from '@cgames/services/CVTextExtractionService';
import { Icons } from './SvgIcons';


interface PersonalizedRecommendationsProps {
  recommendations: PersonalizedRecommendations | null;
  isLoading: boolean;
  error?: string | null;
  competencyScores?: DimensionScore[]; // Add competency scores for alignment
  onShowHelp?: (context: string) => void; // Add help callback
}

const PersonalizedRecommendationsComponent: React.FC<PersonalizedRecommendationsProps> = ({
  recommendations,
  isLoading,
  error = null,
  competencyScores = [],
  onShowHelp
}: PersonalizedRecommendationsProps) => {
  // CV Analysis state
  const [cvData, setCvData] = React.useState<CVData | null>(null);

  // Load CV data from session storage on component mount
  React.useEffect(() => {
    const cvService = new CVTextExtractionService();
    const storedCvData = cvService.getCVData();
    
    if (storedCvData && competencyScores.length > 0) {
      setCvData(storedCvData);
      console.log('✅ CV data loaded from storage:', storedCvData.fileName);
    } else if (storedCvData) {
      setCvData(storedCvData);
      console.log('✅ CV data loaded from storage (no competency scores yet):', storedCvData.fileName);
    } else {
      console.log('ℹ️ No CV data found in storage - user did not upload a CV');
    }
  }, [competencyScores]);

  // Add console logging to track AI generation
  React.useEffect(() => {
    if (recommendations) {
      console.log('🎯 PersonalizedRecommendations: AI recommendations received!');
      console.log('📊 AI Report Details:', {
        model: recommendations.aiModel,
        confidence: recommendations.confidenceScore,
        cvIntegrated: recommendations.cvIntegrated,
        totalRecommendations: recommendations.recommendations?.length || 0,
        aiReportCount: recommendations.recommendations?.filter(rec => rec.dimension === 'AI_REPORT').length || 0,
        generatedAt: recommendations.generatedAt
      });
      
      // Log AI report content specifically
      const aiReports = recommendations.recommendations?.filter(rec => rec.dimension === 'AI_REPORT') || [];
      aiReports.forEach((report, index) => {
        console.log(`📝 AI Report ${index + 1}:`, {
          title: report.title,
          descriptionLength: report.description?.length || 0,
          reasoningLength: report.reasoning?.length || 0,
          confidence: report.confidence
        });
        console.log(`📄 AI Report ${index + 1} - First paragraph preview:`, report.description?.substring(0, 100) + '...');
        console.log(`📄 AI Report ${index + 1} - Second paragraph preview:`, report.reasoning?.substring(0, 100) + '...');
      });
    } else {
      console.log('⚠️ PersonalizedRecommendations: No AI recommendations available');
    }
  }, [recommendations]);

  if (isLoading) {
    console.log('🔄 PersonalizedRecommendations: AI recommendations loading...');
    return (
      <div className="recommendations-section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.AI size={24} color="#667eea" />
          <span>AI Destekli Aday Değerlendirme Raporu</span>
        </h3>
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>AI ile aday değerlendirme raporu hazırlanıyor...</p>
          <small>Yetkinlik skorları analiz ediliyor...</small>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ PersonalizedRecommendations: Error occurred:', error);
    return (
      <div className="recommendations-section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.AI size={24} color="#667eea" />
          <span>AI Destekli Aday Değerlendirme Raporu</span>
        </h3>
        <div className="recommendations-error">
          <p>AI değerlendirme raporu yüklenirken bir hata oluştu: {error}</p>
          <p>Genel değerlendirme gösteriliyor.</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    console.log('⚠️ PersonalizedRecommendations: No recommendations data available');
    return (
      <div className="recommendations-section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.AI size={24} color="#667eea" />
          <span>AI Destekli Aday Değerlendirme Raporu</span>
        </h3>
        <div className="recommendations-empty">
          <p>Henüz AI destekli aday değerlendirme raporu bulunmuyor.</p>
          <p>Rapor oluşturmak için yukarıdaki butona tıklayın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-section" style={{
      background: 'linear-gradient(135deg,rgb(229, 230, 234) 0%, #764ba2 100%)',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
      border: 'none',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.3
      }} />
      
      <div className="recommendations-header" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          position: 'relative'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '12px 24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(241, 223, 223, 0.3)'
          }}>
            <Icons.AI size={24} color="white" style={{ marginRight: '12px' }} />
            <span style={{ 
              color: 'white', 
              fontSize: '18px', 
              fontWeight: '600',
              textShadow: '0 2px 4px rgba(130, 29, 29, 0.1)'
            }}>
              AI Destekli Değerlendirme
            </span>
          </div>
          {onShowHelp && (
            <button 
              onClick={() => onShowHelp('recommendations')}
              style={{
                position: 'absolute',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                padding: '8px',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Bu sayfayı anlamak için yardım alın"
            >
              <Icons.Lightbulb size={20} color="white" />
            </button>
          )}
        </div>
        <h3 style={{
          color: 'white',
          fontSize: '32px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          textAlign: 'center',
          textShadow: '0 2px 8px rgba(44, 18, 18, 0.2)',
          letterSpacing: '-0.5px'
        }}>
          Aday Profil Analizi
        </h3>
        <p style={{
          color: 'rgba(246, 241, 241, 0.9)',
          fontSize: '16px',
          margin: '0',
          textAlign: 'center',
          fontWeight: '400',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          
        </p>
      </div>

      {/* CV Analysis Display - Keep these essential cards */}
      {cvData ? (
        <div className="cv-essential-cards" style={{ 
          marginBottom: '32px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Essential Cards Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Deneyim Profili Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginRight: '16px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  <Icons.Briefcase size={24} color="white" />
                </div>
                <h4 style={{ 
                  color: '#1a202c', 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  margin: '0',
                  letterSpacing: '-0.3px'
                }}>
                  Deneyim Profili
                </h4>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ 
                    fontSize: '48px', 
                    fontWeight: '800', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: '1'
                  }}>
                    {cvData.analysis.experience.years}
                  </span>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#64748b', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginTop: '4px'
                  }}>
                    Yıl Profesyonel Deneyim
                  </div>
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: cvData.analysis.experience.years >= 15 ? '#8B5CF6' : 
                         cvData.analysis.experience.years >= 8 ? '#3B82F6' :
                         cvData.analysis.experience.years >= 4 ? '#10B981' :
                         cvData.analysis.experience.years >= 2 ? '#F59E0B' : '#6B7280',
                  marginBottom: '16px',
                  background: cvData.analysis.experience.years >= 15 ? 'rgba(139, 92, 246, 0.1)' : 
                            cvData.analysis.experience.years >= 8 ? 'rgba(59, 130, 246, 0.1)' :
                            cvData.analysis.experience.years >= 4 ? 'rgba(16, 185, 129, 0.1)' :
                            cvData.analysis.experience.years >= 2 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${cvData.analysis.experience.years >= 15 ? 'rgba(139, 92, 246, 0.2)' : 
                                     cvData.analysis.experience.years >= 8 ? 'rgba(59, 130, 246, 0.2)' :
                                     cvData.analysis.experience.years >= 4 ? 'rgba(16, 185, 129, 0.2)' :
                                     cvData.analysis.experience.years >= 2 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(107, 114, 128, 0.2)'}`
                }}>
                  {cvData.analysis.experience.years >= 15 ? 'Üst Düzey Yönetici' :
                   cvData.analysis.experience.years >= 8 ? 'Orta Düzey Yönetici' :
                   cvData.analysis.experience.years >= 4 ? 'Kıdemli Uzman' :
                   cvData.analysis.experience.years >= 2 ? 'Uzman' : 'Başlangıç Seviyesi'}
                </div>

                {/* CV Extracted Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '16px' }}>
                  {/* Previous Job Title */}
                  {cvData.analysis.experience.positions.length > 0 && (
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      background: 'rgba(99, 102, 241, 0.1)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontWeight: '500',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                      <div style={{ fontWeight: '600', color: '#4338ca', marginBottom: '2px' }}>Son Pozisyon:</div>
                      {cvData.analysis.experience.positions[0]}
                    </div>
                  )}

                  {/* Location */}
                  {cvData.analysis.personalInfo?.location && cvData.analysis.personalInfo.location !== 'Belirtilmemiş' && (
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontWeight: '500',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <div style={{ fontWeight: '600', color: '#047857', marginBottom: '2px' }}>Lokasyon:</div>
                      {cvData.analysis.personalInfo.location}
                    </div>
                  )}

                  {/* Education */}
                  {cvData.analysis.education.degrees.length > 0 && (
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      background: 'rgba(245, 158, 11, 0.1)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontWeight: '500',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                      <div style={{ fontWeight: '600', color: '#d97706', marginBottom: '2px' }}>Eğitim:</div>
                      {cvData.analysis.education.degrees[0]}
                      {cvData.analysis.education.institutions.length > 0 && (
                        <span style={{ color: '#92400e', fontWeight: '400' }}>
                          {' - ' + cvData.analysis.education.institutions[0]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Beceri Analizi Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginRight: '16px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  <Icons.Target size={24} color="white" />
                </div>
                <h4 style={{ 
                  color: '#1a202c', 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  margin: '0',
                  letterSpacing: '-0.3px'
                }}>
                  Beceri Portföyü
                </h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <span style={{ 
                    fontSize: '28px', 
                    fontWeight: '800', 
                    color: '#10b981', 
                    lineHeight: '1'
                  }}>
                    {cvData.analysis.skills.technical.length}
                  </span>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#064e3b', 
                    fontWeight: '600',
                    marginTop: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    Teknik
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  border: '1px solid rgba(245, 158, 11, 0.2)'
                }}>
                  <span style={{ 
                    fontSize: '28px', 
                    fontWeight: '800', 
                    color: '#f59e0b', 
                    lineHeight: '1'
                  }}>
                    {cvData.analysis.skills.leadership.length}
                  </span>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#92400e', 
                    fontWeight: '600',
                    marginTop: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    Liderlik
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <span style={{ 
                    fontSize: '28px', 
                    fontWeight: '800', 
                    color: '#8b5cf6', 
                    lineHeight: '1'
                  }}>
                    {cvData.analysis.skills.soft.length}
                  </span>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#581c87', 
                    fontWeight: '600',
                    marginTop: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    Soft Skills
                  </div>
                </div>
              </div>
            </div>

            {/* İK Değerlendirmesi Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              gridColumn: 'span 1'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginRight: '16px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                  <Icons.User size={24} color="white" />
                </div>
                <h4 style={{ 
                  color: '#1a202c', 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  margin: '0',
                  letterSpacing: '-0.3px'
                }}>
                  İK Değerlendirmesi
                </h4>
              </div>
              <div>
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <h5 style={{ 
                    color: '#1e40af', 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    margin: '0 0 8px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Genel Değerlendirme
                  </h5>
                  <p style={{ 
                    color: '#1e293b', 
                    margin: '0', 
                    fontSize: '14px', 
                    lineHeight: '1.5',
                    fontWeight: '500'
                  }}>
                    {cvData.hrInsights.overallAssessment}
                  </p>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <h5 style={{ 
                    color: '#047857', 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    margin: '0 0 12px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Öne Çıkan Güçlü Yönler
                  </h5>
                  <ul style={{ 
                    margin: '0', 
                    paddingLeft: '0', 
                    listStyle: 'none'
                  }}>
                    {cvData.hrInsights.strengths.slice(0, 3).map((strength, index) => (
                      <li key={index} style={{ 
                        marginBottom: '8px', 
                        lineHeight: '1.4',
                        fontSize: '13px',
                        color: '#1e293b',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'flex-start'
                      }}>
                        <Icons.Check size={16} color="#10b981" style={{ 
                          marginRight: '8px',
                          marginTop: '2px',
                          flexShrink: 0
                        }} />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="cv-analysis-info" style={{ 
          padding: '16px', 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '8px', 
          marginBottom: '16px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ marginBottom: '8px', fontSize: '1.2rem' }}>
            <Icons.Document size={24} color="#cbd5e1" />
          </div>
          <p style={{ margin: '0', color: '#cbd5e1', fontSize: '0.9rem' }}>
            Bu analiz sadece yetkinlik testi verilerine dayanmaktadır.
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
            CV yüklemediğiniz için detaylı CV analizi mevcut değil.
          </p>
        </div>
      )}

      {/* AI Report Section - This is the critical part that shows the two paragraphs */}
      {recommendations.recommendations && recommendations.recommendations.length > 0 && (
        <>
          
          
          {recommendations.recommendations
            .filter(rec => rec.dimension === 'AI_REPORT')
            .map((recommendation: RecommendationItem, index: number) => (
              <div key={`ai-report-${index}`} className="ai-report-card" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                padding: '36px',
                marginBottom: '24px',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '32px',
                zIndex: 1
              }}>
                {/* Header with improved design */}
                <div style={{ 
                  borderLeft: '5px solid transparent',
                  borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1',
                  paddingLeft: '24px', 
                  marginBottom: '32px',
                  position: 'relative'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      padding: '8px',
                      marginRight: '12px'
                    }}>
                      <Icons.Brain size={20} color="white" />
                    </div>
                    <h4 style={{ 
                      color: '#1a202c', 
                      margin: '0', 
                      fontSize: '22px',
                      fontWeight: '700',
                      letterSpacing: '-0.3px'
                    }}>
                      Yapay Zeka Analiz Raporu
                    </h4>
                  </div>
                  <p style={{
                    color: '#64748b',
                    fontSize: '14px',
                    margin: '0',
                    fontWeight: '500',
                    letterSpacing: '0.2px'
                  }}>
                    AI tabanlı kapsamlı aday değerlendirme ve öneriler
                  </p>
                </div>

                {/* First Paragraph - CV and Test Analysis */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '24px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}>
                      Yetkinlik ve CV Uyum Değerlendirmesi
                    </div>
                    <p style={{ 
                      color: '#1e293b', 
                      lineHeight: '1.7', 
                      margin: '16px 0 0 0',
                      fontSize: '15px',
                      fontWeight: '500',
                      textAlign: 'justify',
                      textShadow: 'none',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {recommendation.description}
                    </p>
                  </div>
                </div>

                {/* Second Paragraph - Interview Guide and Recommendations */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '24px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}>
                    Mülakat Rehberi ve Öneriler
                  </div>

                  <p style={{ 
                    color: '#1e293b', 
                    lineHeight: '1.7', 
                    margin: '16px 0 0 0',
                    fontSize: '15px',
                    fontWeight: '500',
                    textAlign: 'justify',
                    textShadow: 'none',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {recommendation.reasoning}
                  </p>
                </div>
              </div>
            ))}
        </>
      )}

      {/* Simple footer with minimal info */}
      <div className="recommendations-footer" style={{ 
        marginTop: '32px', 
        padding: '24px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '32px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px',
              padding: '8px'
            }}>
              <Icons.AI size={16} color="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ 
                color: '#1a202c', 
                fontSize: '14px', 
                margin: '0',
                fontWeight: '700'
              }}>
                AI ile Oluşturuldu
              </p>
              <p style={{ 
                color: '#64748b', 
                fontSize: '12px', 
                margin: '0',
                fontWeight: '500'
              }}>
                {new Date(recommendations.generatedAt).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '10px',
              padding: '8px'
            }}>
              <Icons.Analytics size={16} color="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ 
                color: '#1a202c', 
                fontSize: '14px', 
                margin: '0',
                fontWeight: '700'
              }}>
                Analiz Verisi
              </p>
              <p style={{ 
                color: '#64748b', 
                fontSize: '12px', 
                margin: '0',
                fontWeight: '500'
              }}>
                {recommendations.dataUsed?.join(', ') || 'Yetkinlik skorları ve CV analizi'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRecommendationsComponent;

// Named export for backwards compatibility
export { PersonalizedRecommendationsComponent }; 