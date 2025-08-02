import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', // Local development
    'https://app.olivinhr.com', // HR Platform production
    'https://game.olivinhr.com' // Game Platform production
  ],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API server is running',
    env: {
      hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
    }
  });
});

// Import and setup API routes
async function setupRoutes() {
  try {
    // Basic API endpoints
    app.get('/api/ping', (req, res) => {
      res.json({ message: 'pong', timestamp: new Date().toISOString() });
    });

    // HR API endpoints using real implementations
    app.get('/api/hr/getProjects-simple', async (req, res) => {
      try {
        console.log('🔄 [API Server] Routing to getProjects-simple...');
        console.log('🔍 [API Server] Environment check:', {
          hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
          hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
          hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
        });
        const handler = require('./api/hr/getProjects-simple.js');
        await handler(req, res);
      } catch (error) {
        console.error('❌ [API Server] Error in getProjects-simple:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.get('/api/hr/getProject-simple', async (req, res) => {
      try {
        console.log('🔄 [API Server] Routing to getProject-simple...');
        const handler = require('./api/hr/getProject-simple.js');
        await handler(req, res);
      } catch (error) {
        console.error('❌ [API Server] Error in getProject-simple:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/hr/createProject-simple', async (req, res) => {
      try {
        console.log('🔄 [API Server] Routing to createProject-simple...');
        const handler = require('./api/hr/createProject-simple.ts');
        await handler(req, res);
      } catch (error) {
        console.error('❌ [API Server] Error in createProject-simple:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.get('/api/hr/getCandidateResults', async (req, res) => {
      try {
        console.log('🔄 [API Server] Routing to getCandidateResults...');
        const handler = require('./api/hr/getCandidateResults.js');
        await handler(req, res);
      } catch (error) {
        console.error('❌ [API Server] Error in getCandidateResults:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Invite API endpoints
    app.post('/api/working-invite', async (req, res) => {
      try {
        console.log('🔄 [API Server] Routing to working-invite...');
        const handler = require('./api/working-invite.js');
        await handler(req, res);
      } catch (error) {
        console.error('❌ [API Server] Error in working-invite:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Validate invite token endpoint
    app.get('/api/validate-invite', async (req, res) => {
      try {
        console.log('🔄 [API Server] Routing to validate-invite...');
        const handler = require('./api/validate-invite.js');
        await handler(req, res);
      } catch (error) {
        console.error('❌ [API Server] Error in validate-invite:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Update invite status endpoint
    app.post('/api/update-invite-status', async (req, res) => {
      try {
        console.log('🔄 [API Server] Routing to update-invite-status...');
        const handler = require('./api/update-invite-status.js');
        await handler(req, res);
      } catch (error) {
        console.error('❌ [API Server] Error in update-invite-status:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Candidate API endpoints
    app.post('/api/candidate/submitResult', async (req, res) => {
      try {
        console.log('🔄 [API Server] Routing to candidate/submitResult...');
        const handler = require('./api/candidate/submitResult.js');
        await handler(req, res);
      } catch (error) {
        console.error('❌ [API Server] Error in candidate/submitResult:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // SuperAdmin API endpoints
    app.post('/api/superadmin/createCompany', async (req, res) => {
      try {
        console.log('🔄 [API Server] Routing to createCompany...');
        const handler = require('./api/superadmin/createCompany.ts');
        await handler(req, res);
      } catch (error) {
        console.error('❌ [API Server] Error in createCompany:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // SendGrid test endpoint
    app.post('/api/test-sendgrid', async (req, res) => {
      try {
        console.log('📧 [API Server] Testing SendGrid...');
        const sgMail = require('@sendgrid/mail');
        
        if (!process.env.SENDGRID_API_KEY) {
          throw new Error('SENDGRID_API_KEY not configured');
        }
        
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const msg = {
          to: req.body.email || 'test@example.com',
          from: 'noreply@olivinhr.com',
          subject: 'SendGrid Test Email',
          html: '<h1>SendGrid is working!</h1><p>This is a test email from your local API server.</p>'
        };
        
        await sgMail.send(msg);
        console.log('✅ [SendGrid] Test email sent successfully');
        res.json({ success: true, message: 'Test email sent successfully!' });
      } catch (error) {
        console.error('❌ [SendGrid] Error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Welcome email test endpoint
    app.post('/api/test-welcome-email', async (req, res) => {
      try {
        console.log('📧 [API Server] Testing Welcome Email...');
        
        // Import the same email function used in createCompany
        const createCompanyModule = require('./api/superadmin/createCompany.ts');
        
        // Extract email function by creating a temporary context
        const sgMail = require('@sendgrid/mail');
        
        if (!process.env.SENDGRID_API_KEY) {
          throw new Error('SENDGRID_API_KEY not configured');
        }
        
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const { email, name, companyName, temporaryPassword } = req.body;
        const loginUrl = process.env.VITE_HR_PLATFORM_URL || 'http://localhost:5173';
        
        const emailContent = {
          to: email,
          from: 'noreply@olivinhr.com',
          subject: `Welcome to ${companyName} - HR Platform Access`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to ${companyName}!</h2>
              
              <p>Hello ${name},</p>
              
              <p>Your HR admin account has been successfully created. You can now access the HR platform to manage your company's recruitment process.</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>Login Details:</h3>
                <p><strong>Email:</strong> ${email}</p>
                ${temporaryPassword ? `<p><strong>Temporary Password:</strong> ${temporaryPassword}</p>` : ''}
                <p><strong>Login URL:</strong> <a href="${loginUrl}/hr/login">${loginUrl}/hr/login</a></p>
              </div>
              
              ${temporaryPassword ? '<p><em>Please change your password after your first login for security.</em></p>' : ''}
              
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>The OlivinHR Team</p>
            </div>
          `
        };
        
        await sgMail.send(emailContent);
        console.log('✅ [Welcome Email] Welcome email sent successfully to:', email);
        res.json({ success: true, message: 'Welcome email sent successfully!', recipient: email });
      } catch (error) {
        console.error('❌ [Welcome Email] Error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Fallback for other HR endpoints
    app.use('/api/hr', (req, res) => {
      console.log(`HR API call: ${req.path}`, req.body);
      res.json({ 
        success: false, 
        message: 'Local API server - function not implemented',
        path: req.path 
      });
    });

    app.use('/api/candidate', (req, res) => {
      console.log(`Candidate API call: ${req.path}`, req.body);
      res.json({ 
        success: false, 
        message: 'Local API server - function not implemented',
        path: req.path 
      });
    });

    app.use('/api/invite', (req, res) => {
      console.log(`Invite API call: ${req.path}`, req.query);
      res.json({ 
        success: false, 
        message: 'Local API server - function not implemented',
        path: req.path 
      });
    });

  } catch (error) {
    console.error('Error setting up routes:', error);
  }
}

// Start server
setupRoutes().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Local API server running on http://localhost:${PORT}`);
    console.log(`📱 Game Platform: ${process.env.VITE_GAME_PLATFORM_URL || 'http://localhost:5174'}`);
    console.log(`🏢 HR Platform: ${process.env.VITE_HR_PLATFORM_URL || 'http://localhost:5173'}`);
    console.log(`⚡ API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`✅ Real API implementations loaded!`);
    console.log(`🔑 Firebase config loaded:`, {
      projectId: process.env.FIREBASE_PROJECT_ID || 'NOT_SET',
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
    });
  });
});

export default app; 