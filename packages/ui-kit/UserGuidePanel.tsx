import React, { useState } from 'react';
import { Icons } from './SvgIcons';


interface UserGuidePanelProps {
  currentFilter: string;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const UserGuidePanel: React.FC<UserGuidePanelProps> = ({ currentFilter, onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  const guideContent = {
    overview: {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Book size={20} color="#ffffff" />
          <span>Genel Bakış</span>
        </div>
      ),
      content: (
        <div>
          <h4>Sonuç Ekranı Rehberi</h4>
          <p>Bu ekranda aday değerlendirme sonuçlarınızı görüntüleyebilir ve analiz edebilirsiniz.</p>
          
          <div className="guide-section">
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Target size={16} color="#10b981" />
              <span>Ana Özellikler</span>
            </h5>
            <ul>
              <li>AI destekli aday değerlendirme raporları</li>
              <li>Yetkinlik bazlı skorlama sistemi</li>
              <li>Davranışsal analiz ve öngörüler</li>
              <li>Kişiselleştirilmiş mülakat önerileri</li>
              <li>PDF olarak dışa aktarma</li>
            </ul>
          </div>

          <div className="guide-section">
            <h5>🧭 Navigasyon</h5>
            <p>Üst kısımdaki kartları kullanarak farklı analiz türleri arasında geçiş yapabilirsiniz.</p>
          </div>
        </div>
      )
    },
    ai: {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.AI size={20} color="#ffffff" />
          <span>AI Değerlendirme</span>
        </div>
      ),
      content: (
        <div>
          <h4>Yapay Zeka Analizi</h4>
          <p>AI destekli değerlendirme sistemi, aday performansını kapsamlı şekilde analiz eder.</p>
          
          <div className="guide-section">
            <h5>Nasıl Çalışır?</h5>
            <ul>
              <li>Yetkinlik test sonuçları otomatik analiz edilir</li>
              <li>CV verileri ile test sonuçları karşılaştırılır</li>
              <li>Pozisyon gereksinimleri ile uyum değerlendirilir</li>
              <li>Gelişim alanları ve öneriler sunulur</li>
            </ul>
          </div>

          <div className="guide-tip">
            <strong>💡 İpucu:</strong> AI asistan ile etkileşime geçerek daha detaylı bilgi alabilirsiniz.
          </div>
        </div>
      )
    },
    competencies: {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Analytics size={20} color="#ffffff" />
          <span>Yetkinlikler</span>
        </div>
      ),
      content: (
        <div>
          <h4>Yetkinlik Değerlendirmesi</h4>
          <p>Her yetkinlik alanında detaylı performans analizi yapılır.</p>
          
          <div className="guide-section">
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Target size={16} color="#10b981" />
              <span>Yetkinlik Kategorileri</span>
            </h5>
            <ul>
              <li><strong>Liderlik:</strong> Ekip yönetimi ve karar alma</li>
              <li><strong>İletişim:</strong> Sözlü ve yazılı iletişim becerileri</li>
              <li><strong>Problem Çözme:</strong> Analitik düşünce ve yaratıcılık</li>
              <li><strong>Takım Çalışması:</strong> İş birliği ve uyum</li>
              <li><strong>Stres Yönetimi:</strong> Baskı altında performans</li>
            </ul>
          </div>

          <div className="guide-section">
            <h5>📈 Skor Yorumlama</h5>
            <ul>
              <li><strong>Yüksek (80%+):</strong> Güçlü yetkinlik alanı</li>
              <li><strong>Orta (50-80%):</strong> Gelişim potansiyeli var</li>
              <li><strong>Düşük (50%-altı):</strong> Gelişim odaklı alan</li>
            </ul>
          </div>
        </div>
      )
    },
    behavior: {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Brain size={20} color="#ffffff" />
          <span>Davranış Analizi</span>
        </div>
      ),
      content: (
        <div>
          <h4>Davranışsal Değerlendirme</h4>
          <p>Adayın davranış patternleri ve iş yerindeki potansiyel performansı analiz edilir.</p>
          
          <div className="guide-section">
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Target size={16} color="#10b981" />
              <span>Önemli Göstergeler</span>
            </h5>
            <ul>
              <li><strong>Karar Verme Hızı:</strong> Kritik durumlar için önemli</li>
              <li><strong>Risk Alma Eğilimi:</strong> İnovasyon potansiyeli</li>
              <li><strong>Uyum Kabiliyeti:</strong> Değişen şartlara adaptasyon</li>
              <li><strong>Motivasyon Kaynakları:</strong> Uzun vadeli başarı faktörleri</li>
            </ul>
          </div>
        </div>
      )
    },
    feedback: {
      title: "💬 Geri Bildirim",
      content: (
        <div>
          <h4>Test Deneyimi Değerlendirmesi</h4>
          <p>Test deneyiminizi değerlendirin ve sistemin geliştirilmesine katkıda bulunun.</p>
          
          <div className="guide-section">
            <h5>⭐ Değerlendirme Kriterleri</h5>
            <ul>
              <li><strong>Doğruluk:</strong> Sonuçların gerçekçiliği</li>
              <li><strong>Deneyim:</strong> Test alma deneyimi</li>
              <li><strong>Adalet:</strong> Objektif değerlendirme</li>
              <li><strong>Fayda:</strong> Sonuçların kullanışlılığı</li>
            </ul>
          </div>

          <div className="guide-tip">
            <strong>📝 Not:</strong> Geri bildirimleriniz sistemin geliştirilmesi için çok değerli.
          </div>
        </div>
      )
    }
  };

  const getContentByFilter = () => {
    switch (currentFilter) {
      case 'öneriler':
        return guideContent.ai;
      case 'yetkinlikler':
        return guideContent.competencies;
      case 'davranış-analizi':
        return guideContent.behavior;
      case 'feedback':
        return guideContent.feedback;
      default:
        return guideContent.overview;
    }
  };

  const navigationTabs = [
    { key: 'overview', icon: <Icons.Book size={16} />, label: 'Genel Bakış' },
    { key: 'ai', icon: <Icons.AI size={16} />, label: 'AI Değerlendirme' },
    { key: 'competencies', icon: <Icons.Analytics size={16} />, label: 'Yetkinlikler' },
    { key: 'behavior', icon: <Icons.Brain size={16} />, label: 'Davranış Analizi' },
  ];

  return (
    <div className={`user-guide-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="guide-header">
        <div className="guide-title">
          {!isCollapsed && <span>📚 Kullanım Rehberi</span>}
        </div>
        <button
          className="collapse-button"
          onClick={handleCollapseToggle}
          title={isCollapsed ? "Rehberi Genişlet" : "Rehberi Daralt"}
        >
          {isCollapsed ? <Icons.Book size={20} /> : <Icons.Collapse size={20} />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="guide-menu">
            {navigationTabs.map(item => (
              <button
                key={item.key}
                className={`guide-menu-item ${activeSection === item.key ? 'active' : ''}`}
                onClick={() => setActiveSection(item.key)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="guide-content">
            <div className="current-context">
              <span className="context-indicator">📍 Şu anda görüntülenen:</span>
              <span className="context-value">{getContentByFilter().title}</span>
            </div>
            
            <div className="guide-content-body">
              {guideContent[activeSection as keyof typeof guideContent].content}
            </div>
          </div>

          <div className="guide-footer">
            <div className="quick-tips">
              <h5>⚡ Hızlı İpuçları</h5>
              <ul>
                <li>Kartlara tıklayarak geçiş yapın</li>
                <li>AI asistan ile sohbet edin</li>
                <li>Sonuçları PDF olarak indirin</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserGuidePanel; 