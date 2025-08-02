import i18n from '../i18n';

// Export competencies with translations
export const getCompetencies = () => {
  const currentLanguage = i18n.language || 'en';
  
  if (currentLanguage === 'tr') {
    return [
      { name: "DM", color: "#FF6B6B", fullName: "Karar Verme" },
      { name: "IN", color: "#4ECDC4", fullName: "İnisiyatif" },
      { name: "AD", color: "#45B7D1", fullName: "Uyum Sağlama" },
      { name: "CM", color: "#96CEB4", fullName: "İletişim" },
      { name: "ST", color: "#FFD93D", fullName: "Stratejik Düşünme" },
      { name: "TO", color: "#6C5CE7", fullName: "Zaman Yönetimi" },
      { name: "RL", color: "#E17055", fullName: "Risk Liderliği" },
      { name: "RI", color: "#00B894", fullName: "Risk Zekası" }
    ];
  }
  
  // English translations
  return [
    { name: "DM", color: "#FF6B6B", fullName: "Decision Making" },
    { name: "IN", color: "#4ECDC4", fullName: "Initiative" },
    { name: "AD", color: "#45B7D1", fullName: "Adaptability" },
    { name: "CM", color: "#96CEB4", fullName: "Communication" },
    { name: "ST", color: "#FFD93D", fullName: "Strategic Thinking" },
    { name: "TO", color: "#6C5CE7", fullName: "Time Management" },
    { name: "RL", color: "#E17055", fullName: "Risk Leadership" },
    { name: "RI", color: "#00B894", fullName: "Risk Intelligence" }
  ];
}; 