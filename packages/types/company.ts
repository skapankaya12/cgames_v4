export interface Company {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  licenseCount: number;
  usedLicensesCount: number;
  maxUsers: number;
  createdBy?: string; // ID of the super_admin who created this company
}

export interface CompanyData {
  name: string;
  createdAt: number;
  updatedAt: number;
  licenseCount: number;
  usedLicensesCount: number;
  maxUsers: number;
  createdBy?: string;
} 