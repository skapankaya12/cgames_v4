import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test-simple', (req, res) => {
  console.log('✅ Test endpoint hit');
  res.json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Company creation endpoint (simplified)
app.post('/api/superadmin/createCompany', async (req, res) => {
  console.log('🚀 CreateCompany endpoint hit');
  console.log('Request body:', req.body);
  
  try {
    // For now, just return success
    res.json({
      success: true,
      message: 'Company creation endpoint is reachable',
      data: req.body
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Simple API server running on http://localhost:${PORT}`);
}); 