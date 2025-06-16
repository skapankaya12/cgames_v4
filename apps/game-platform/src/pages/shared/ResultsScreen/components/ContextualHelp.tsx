import React from 'react';
import { Icons } from '@cgames/ui-kit';

interface ContextualHelpProps {
  context: string;
  onClose: () => void;
}

interface HelpContent {
  title: string;
  description: string;
  tips: string[];
  relatedActions?: {
    label: string;
    action: string;
  }[];
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  context,
  onClose
}) => {
  const getHelpContent = (context: string): HelpContent => {
    const helpContentMap: Record<string, HelpContent> = {
      'dashboard-overview': {
        title: 'Genel Bakış Sayfası',
        description: 'Bu sayfa, bilişsel oyun değerlendirmenizin genel bir özetini sunar. Tüm önemli metrikleri tek bakışta görebilirsiniz.',
        tips: [
          'Genel performans skorunuz, tüm yetkinlik alanlarının ortalamasıdır',
          'En güçlü yetkinlik ve gelişim alanı kartları, odaklanmanız gereken noktaları gösterir',
          'Hızlı erişim kartlarını kullanarak detaylı analizlere geçebilirsiniz',
          'AI öngörüler kartında kişiselleştirilmiş önerilerinizin özeti bulunur'
        ],
        relatedActions: [
          { label: 'Yetkinlik detaylarını gör', action: 'view-competencies' },
          { label: 'AI önerilerini incele', action: 'view-recommendations' }
        ]
      },
      'competencies': {
        title: 'Yetkinlikler Sayfası',
        description: 'Bu sayfada tüm yetkinlik alanlarınızın detaylı analizini görebilirsiniz.',
        tips: [
          'Her kart bir yetkinlik alanını temsil eder',
          'Yüzdelik skorlar, o alandaki performansınızı gösterir',
          'Renk kodları: Yeşil (mükemmel), Sarı (iyi), Turuncu (orta), Kırmızı (gelişim gerekli)',
          'Kategori etiketleri, yetkinlikleri gruplandırır'
        ]
      },
      'behavior-analysis': {
        title: 'Davranış Analizi',
        description: 'Oyun sırasındaki davranış patternlerinizi ve etkileşim verilerinizi gösterir.',
        tips: [
          'Zaman analizi, oyunları tamamlama sürenizi gösterir',
          'Etkileşim verileri, oyun stratejileriniz hakkında bilgi verir',
          'Bu veriler, bilişsel süreçlerinizi anlamaya yardımcı olur'
        ]
      },
      'recommendations': {
        title: 'AI Öneriler',
        description: 'Yapay zeka tarafından oluşturulan kişiselleştirilmiş gelişim önerileriniz.',
        tips: [
          'Öneriler, performansınız ve davranış verilerinize dayanarak oluşturulur',
          'Her öneri belirli bir yetkinlik alanı için tasarlanmıştır',
          'Önerileri takip ederek gelişim sürecinizi hızlandırabilirsiniz'
        ]
      },
      'feedback': {
        title: 'Geri Bildirim',
        description: 'Test deneyiminiz hakkında görüşlerinizi paylaşabileceğiniz sayfa.',
        tips: [
          'Puanlama sistemini kullanarak deneyiminizi değerlendirin',
          'Yazılı geri bildirimleriniz ürünümüzü geliştirmemize yardımcı olur',
          'Tüm geri bildirimler anonim olarak değerlendirilir'
        ]
      }
    };

    return helpContentMap[context] || {
      title: 'Yardım',
      description: 'Bu bölüm hakkında yardım bilgisi mevcut değil.',
      tips: ['Daha fazla bilgi için lütfen destek ekibiyle iletişime geçin.']
    };
  };

  const helpContent = getHelpContent(context);

  return (
    <div className="contextual-help-overlay">
      <div className="contextual-help-modal">
        <div className="help-header">
          <div className="help-title">
            <Icons.Lightbulb size={24} color="#667eea" />
            <h3>{helpContent.title}</h3>
          </div>
          <button className="help-close" onClick={onClose}>
            <Icons.Close size={20} />
          </button>
        </div>

        <div className="help-content">
          <div className="help-description">
            <p>{helpContent.description}</p>
          </div>

          <div className="help-tips">
            <h4>
              <Icons.Lightbulb size={16} color="#f59e0b" />
              İpuçları
            </h4>
            <ul>
              {helpContent.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          {helpContent.relatedActions && (
            <div className="help-actions">
              <h4>
                <Icons.Target size={16} color="#f59e0b" />
                İlgili İşlemler
              </h4>
              <div className="help-action-buttons">
                {helpContent.relatedActions.map((action, index) => (
                  <button
                    key={index}
                    className="help-action-button"
                    onClick={() => {
                      // Handle action - could dispatch events or call callbacks
                      console.log(`Action: ${action.action}`);
                      onClose();
                    }}
                  >
                    {action.label}
                    <Icons.Collapse size={16} color="#10b981" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="help-footer">
          <div className="help-footer-info">
            <Icons.Warning size={16} color="#6b7280" />
            <span>Bu yardım panelini istediğiniz zaman açabilirsiniz</span>
          </div>
          <button className="help-got-it" onClick={onClose}>
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
}; 