import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebase } from '../firebase-debug';
import { verifyHrUserRole } from '../../packages/services/auth-utils-server';

interface LicenseInfo {
  companyId: string;
  companyName: string;
  licenseCount: number;
  usedLicensesCount: number;
  availableLicenses: number;
  licenseType: string;
  expirationDate?: string;
  isActive: boolean;
  canSendInvite: boolean;
  usage: {
    thisMonth: number;
    lastMonth: number;
    totalUsed: number;
  };
}

/**
 * GET /api/hr/getLicenseInfo
 * 
 * Get company license information and usage statistics
 * 
 * Query Parameters:
 * - hrId: string (required) - HR user ID
 * 
 * Returns:
 * - success: boolean
 * - licenseInfo: LicenseInfo
 * - error?: string
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 [Get License Info API] Request received:', req.method, req.url);
  
  // Set CORS headers for cross-origin requests from app.olivinhr.com
  const allowedOrigins = new Set([
    'https://app.olivinhr.com',
    'https://hub.olivinhr.com',
    'https://cgames-v4-hr-platform.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ]);

  const origin = (req.headers.origin as string) || '';
  const allowOrigin = allowedOrigins.has(origin) ? origin : 'https://app.olivinhr.com';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('✅ [Get License Info API] Handling OPTIONS request');
      return res.status(200).json({ success: true });
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      console.log('❌ [Get License Info API] Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Extract and validate parameters
    const { hrId } = req.query;

    if (!hrId || typeof hrId !== 'string') {
      console.log('❌ [Get License Info API] Missing required hrId parameter');
      return res.status(400).json({
        success: false,
        error: 'hrId query parameter is required'
      });
    }

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    console.log('🔄 [Get License Info API] Step 1: Verifying HR user permissions...');
    
    // Step 1: Verify HR user has admin or employee role (both can view license info)
    const hrUser = await verifyHrUserRole(hrId, ['admin', 'employee']);
    const companyId = hrUser.companyId;

    console.log(`✅ [Get License Info API] HR user verified - Role: ${hrUser.role}, Company: ${companyId}`);

    console.log('🔄 [Get License Info API] Step 2: Fetching company license data...');
    
    // Step 2: Fetch company data including license information
    const companyDoc = await db.collection('companies').doc(companyId).get();
    
    if (!companyDoc.exists) {
      console.log('❌ [Get License Info API] Company not found');
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    const companyData = companyDoc.data();
    const licenseCount = companyData?.licenseCount || 0;
    const usedLicensesCount = companyData?.usedLicensesCount || 0;
    const availableLicenses = licenseCount - usedLicensesCount;
    const canSendInvite = availableLicenses > 0;

    console.log(`📊 [Get License Info API] License status - Total: ${licenseCount}, Used: ${usedLicensesCount}, Available: ${availableLicenses}`);

    console.log('🔄 [Get License Info API] Step 3: Calculating usage statistics...');
    
    // Step 3: Calculate monthly usage statistics
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime();

    // Count invites sent this month and last month
    const invitesCollection = db.collection('invites');
    
    // This month's invites
    const thisMonthInvitesQuery = invitesCollection
      .where('companyId', '==', companyId)
      .where('timestamp', '>=', thisMonthStart);
    const thisMonthInvitesSnapshot = await thisMonthInvitesQuery.get();
    const thisMonthUsage = thisMonthInvitesSnapshot.size;

    // Last month's invites
    const lastMonthInvitesQuery = invitesCollection
      .where('companyId', '==', companyId)
      .where('timestamp', '>=', lastMonthStart)
      .where('timestamp', '<=', lastMonthEnd);
    const lastMonthInvitesSnapshot = await lastMonthInvitesQuery.get();
    const lastMonthUsage = lastMonthInvitesSnapshot.size;

    console.log(`📈 [Get License Info API] Usage - This month: ${thisMonthUsage}, Last month: ${lastMonthUsage}`);

    console.log('🔄 [Get License Info API] Step 4: Preparing license info response...');
    
    // Step 4: Prepare comprehensive license information
    const licenseInfo: LicenseInfo = {
      companyId,
      companyName: companyData?.name || 'Unknown Company',
      licenseCount,
      usedLicensesCount,
      availableLicenses,
      licenseType: companyData?.licenseType || 'standard',
      expirationDate: companyData?.licenseExpirationDate,
      isActive: (companyData?.licenseStatus !== 'expired' && companyData?.licenseStatus !== 'suspended'),
      canSendInvite,
      usage: {
        thisMonth: thisMonthUsage,
        lastMonth: lastMonthUsage,
        totalUsed: usedLicensesCount,
      },
    };

    // Check if license is near expiration (within 30 days)
    let licenseWarnings = [];
    if (licenseInfo.expirationDate) {
      const expirationTime = new Date(licenseInfo.expirationDate).getTime();
      const thirtyDaysFromNow = Date.now() + (30 * 24 * 60 * 60 * 1000);
      
      if (expirationTime < Date.now()) {
        licenseWarnings.push('License has expired');
        licenseInfo.isActive = false;
      } else if (expirationTime < thirtyDaysFromNow) {
        licenseWarnings.push('License expires within 30 days');
      }
    }

    // Check if license usage is high
    const usagePercentage = licenseCount > 0 ? (usedLicensesCount / licenseCount) * 100 : 0;
    if (usagePercentage >= 90) {
      licenseWarnings.push('License usage is at 90% or above');
    } else if (usagePercentage >= 75) {
      licenseWarnings.push('License usage is at 75% or above');
    }

    console.log('✅ [Get License Info API] License information prepared successfully');

    // Success response
    return res.status(200).json({
      success: true,
      licenseInfo,
      warnings: licenseWarnings,
      usagePercentage: Math.round(usagePercentage),
      fetchedAt: Date.now(),
    });

  } catch (error: any) {
    console.error('🚨 [Get License Info API] Error:', error);
    
    // Handle permission errors specifically
    if (error.message?.includes('Insufficient permissions')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    if (error.message?.includes('HR user not found')) {
      return res.status(404).json({
        success: false,
        error: 'HR user not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch license information'
    });
  }
} 