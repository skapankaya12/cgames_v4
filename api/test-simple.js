export default function handler(req, res) {
  console.log('✅ Test endpoint hit:', req.method, req.url);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }
  
  return res.status(200).json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
} 