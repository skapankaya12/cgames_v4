export class PersonalInfoExtractor {
  extract(cvText: string) {
    return {
      location: this.extractLocation(cvText),
      email: this.extractEmail(cvText),
      phone: this.extractPhone(cvText)
    };
  }

  private extractLocation(cvText: string): string {
    const locationPatterns = [
      /(?:address|adres|location|konum|yaşadığı|ikamet)[\s:]*([^\n\r,]{5,50})/gi,
      /(?:istanbul|ankara|izmir|bursa|antalya|adana|gaziantep|konya|şanlıurfa|mersin)/gi,
      /(\w+,\s*\w+)/g // City, Country pattern
    ];

    for (const pattern of locationPatterns) {
      const matches = cvText.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].trim();
      }
    }

    return '';
  }

  private extractEmail(cvText: string): string {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const match = cvText.match(emailPattern);
    return match ? match[0] : '';
  }

  private extractPhone(cvText: string): string {
    const phonePatterns = [
      /(?:\+90|0)?[\s\-\.]?5\d{2}[\s\-\.]?\d{3}[\s\-\.]?\d{2}[\s\-\.]?\d{2}/g,
      /(?:\+90|0)?[\s\-\.]?\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{2}[\s\-\.]?\d{2}/g,
      /(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g
    ];

    for (const pattern of phonePatterns) {
      const match = cvText.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }

    return '';
  }
} 