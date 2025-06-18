module.exports = (req, res) => {
  console.log('Root ping function called');
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    success: true,
    message: 'Root ping successful',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
}; 