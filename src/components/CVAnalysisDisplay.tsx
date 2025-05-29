import React from 'react';
import type { CVData } from '../types/CVTypes';
import './CVAnalysisDisplay.css';

interface CVAnalysisDisplayProps {
  cvData: CVData;
  competencyAlignment?: {
    [competency: string]: {
      cvEvidence: string[];
      scoreAlignment: string;
      recommendation: string;
    }
  };
}

const CVAnalysisDisplay: React.FC<CVAnalysisDisplayProps> = ({ cvData, competencyAlignment }) => {
  const { analysis, hrInsights } = cvData;

  const getCareerLevel = (years: number): { level: string; color: string } => {
    if (years >= 15) return { level: 'Üst Düzey Yönetici', color: '#8B5CF6' };
    if (years >= 8) return { level: 'Orta Düzey Yönetici', color: '#3B82F6' };
    if (years >= 4) return { level: 'Kıdemli Uzman', color: '#10B981' };
    if (years >= 2) return { level: 'Uzman', color: '#F59E0B' };
    return { level: 'Başlangıç Seviyesi', color: '#6B7280' };
  };

  const careerInfo = getCareerLevel(analysis.experience.years);

  return (
    <div className="cv-analysis-section">
      <div className="cv-analysis-header">
        <h3>📄 CV Analiz Sonuçları</h3>
        <p className="cv-analysis-subtitle">
          Özgeçmiş verilerine dayalı aday profili analizi
        </p>
      </div>

      {/* Experience Overview */}
      <div className="cv-overview-grid">
        <div className="cv-overview-card">
          <div className="cv-card-header">
            <span className="cv-card-icon">💼</span>
            <h4>Deneyim Profili</h4>
          </div>
          <div className="cv-card-content">
            <div className="experience-years">
              <span className="years-number">{analysis.experience.years}</span>
              <span className="years-label">Yıl Deneyim</span>
            </div>
            <div className="career-level" style={{ color: careerInfo.color }}>
              {careerInfo.level}
            </div>
            <div className="companies-count">
              {analysis.experience.companies.length} şirkette çalışmış
            </div>
          </div>
        </div>

        <div className="cv-overview-card">
          <div className="cv-card-header">
            <span className="cv-card-icon">🎯</span>
            <h4>Beceri Analizi</h4>
          </div>
          <div className="cv-card-content">
            <div className="skills-summary">
              <div className="skill-category">
                <span className="skill-count">{analysis.skills.technical.length}</span>
                <span className="skill-label">Teknik Beceri</span>
              </div>
              <div className="skill-category">
                <span className="skill-count">{analysis.skills.leadership.length}</span>
                <span className="skill-label">Liderlik Becerisi</span>
              </div>
              <div className="skill-category">
                <span className="skill-count">{analysis.skills.soft.length}</span>
                <span className="skill-label">Soft Skill</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cv-overview-card">
          <div className="cv-card-header">
            <span className="cv-card-icon">🎓</span>
            <h4>Eğitim & Sertifikalar</h4>
          </div>
          <div className="cv-card-content">
            <div className="education-summary">
              {analysis.education.degrees.length > 0 ? (
                <div className="education-item">
                  <strong>{analysis.education.degrees[0]}</strong>
                  {analysis.education.institutions.length > 0 && (
                    <span className="institution">- {analysis.education.institutions[0]}</span>
                  )}
                </div>
              ) : (
                <span className="no-data">Eğitim bilgisi bulunamadı</span>
              )}
              {analysis.education.certifications.length > 0 && (
                <div className="certifications">
                  <strong>Sertifikalar:</strong>
                  <span>{analysis.education.certifications.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HR Insights */}
      <div className="hr-insights-section">
        <h4>👨‍💼 İK Değerlendirmesi</h4>
        <div className="insights-grid">
          <div className="insight-card overall-assessment">
            <h5>Genel Değerlendirme</h5>
            <p>{hrInsights.overallAssessment}</p>
          </div>
          
          <div className="insight-card strengths">
            <h5>Güçlü Yönler</h5>
            <ul>
              {hrInsights.strengths.slice(0, 4).map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="insight-card concerns">
            <h5>Gelişim Alanları</h5>
            <ul>
              {hrInsights.concerns.slice(0, 4).map((concern, index) => (
                <li key={index}>{concern}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Competency Alignment */}
      {competencyAlignment && (
        <div className="competency-alignment-section">
          <h4>🔗 Yetkinlik Uyum Analizi</h4>
          <p className="alignment-subtitle">CV deneyimi ile test sonuçlarının karşılaştırması</p>
          
          <div className="alignment-grid">
            {Object.entries(competencyAlignment).map(([competency, alignment]) => (
              <div key={competency} className="alignment-card">
                <div className="alignment-header">
                  <span className="competency-code">{competency}</span>
                  <span className={`alignment-status ${alignment.scoreAlignment.toLowerCase().replace(' ', '-')}`}>
                    {alignment.scoreAlignment}
                  </span>
                </div>
                
                {alignment.cvEvidence.length > 0 && (
                  <div className="cv-evidence">
                    <strong>CV Kanıtları:</strong>
                    <ul>
                      {alignment.cvEvidence.map((evidence, index) => (
                        <li key={index}>{evidence}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="alignment-recommendation">
                  <strong>Değerlendirme:</strong>
                  <p>{alignment.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Skills */}
      <div className="detailed-skills-section">
        <h4>💡 Detaylı Beceri Analizi</h4>
        
        <div className="skills-categories">
          {analysis.skills.technical.length > 0 && (
            <div className="skill-category-section">
              <h5>Teknik Beceriler</h5>
              <div className="skills-tags">
                {analysis.skills.technical.slice(0, 8).map((skill, index) => (
                  <span key={index} className="skill-tag technical">{skill}</span>
                ))}
              </div>
            </div>
          )}
          
          {analysis.skills.leadership.length > 0 && (
            <div className="skill-category-section">
              <h5>Liderlik Becerileri</h5>
              <div className="skills-tags">
                {analysis.skills.leadership.slice(0, 6).map((skill, index) => (
                  <span key={index} className="skill-tag leadership">{skill}</span>
                ))}
              </div>
            </div>
          )}
          
          {analysis.skills.soft.length > 0 && (
            <div className="skill-category-section">
              <h5>Soft Skills</h5>
              <div className="skills-tags">
                {analysis.skills.soft.slice(0, 6).map((skill, index) => (
                  <span key={index} className="skill-tag soft">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Career Highlights */}
      {analysis.achievements.length > 0 && (
        <div className="achievements-section">
          <h4>🏆 Kariyer Başarıları</h4>
          <div className="achievements-list">
            {analysis.achievements.slice(0, 5).map((achievement, index) => (
              <div key={index} className="achievement-item">
                <span className="achievement-icon">✨</span>
                <span className="achievement-text">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Industry Experience */}
      {analysis.experience.industries.length > 0 && (
        <div className="industry-experience-section">
          <h4>🏭 Sektör Deneyimi</h4>
          <div className="industries-list">
            {analysis.experience.industries.map((industry, index) => (
              <span key={index} className="industry-tag">{industry}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CVAnalysisDisplay; 