module.exports = (req, res) => {
  console.log('Basic test function called');
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    success: true,
    message: 'Basic test function is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}; 