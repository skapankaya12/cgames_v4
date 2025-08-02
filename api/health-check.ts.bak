export default function handler(req: any, res: any) {
  console.log('🏥 [Health Check] Request received');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const healthData = {
      success: true,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      message: 'Health check passed - basic function is working'
    };

    console.log('✅ [Health Check] Responding with health data');
    res.status(200).json(healthData);
    
  } catch (error: any) {
    console.error('🚨 [Health Check] Error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 