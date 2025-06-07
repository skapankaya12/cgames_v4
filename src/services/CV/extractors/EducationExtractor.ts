export class EducationExtractor {
  extract(cvText: string) {
    return {
      degrees: this.extractDegrees(cvText),
      institutions: this.extractInstitutions(cvText),
      certifications: this.extractCertifications(cvText)
    };
  }

  private extractDegrees(cvText: string): string[] {
    const degreeKeywords = [
      'lisans', 'bachelor', 'yüksek lisans', 'master', 'doktora', 'phd',
      'mba', 'ön lisans', 'associate', 'lise', 'high school'
    ];

    const degrees: string[] = [];
    const lowerCvText = cvText.toLowerCase();

    degreeKeywords.forEach(degree => {
      if (lowerCvText.includes(degree)) {
        degrees.push(degree);
      }
    });

    return [...new Set(degrees)];
  }

  private extractInstitutions(cvText: string): string[] {
    const institutionKeywords = [
      'üniversite', 'university', 'institut', 'institute', 'okul', 'school',
      'akademi', 'academy', 'kolej', 'college'
    ];

    const institutions: string[] = [];
    const lines = cvText.split('\n');

    lines.forEach(line => {
      const cleanLine = line.trim();
      institutionKeywords.forEach(keyword => {
        if (cleanLine.toLowerCase().includes(keyword) && 
            cleanLine.length > 5 && cleanLine.length < 100) {
          if (!institutions.includes(cleanLine)) {
            institutions.push(cleanLine);
          }
        }
      });
    });

    return institutions.slice(0, 10);
  }

  private extractCertifications(cvText: string): string[] {
    const certificationKeywords = [
      'sertifika', 'certificate', 'sertifikasyon', 'certification',
      'diploma', 'belge', 'credential', 'pmp', 'cissp', 'itil', 'scrum'
    ];

    const certifications: string[] = [];
    const lowerCvText = cvText.toLowerCase();

    certificationKeywords.forEach(cert => {
      if (lowerCvText.includes(cert)) {
        certifications.push(cert);
      }
    });

    return [...new Set(certifications)];
  }
} 