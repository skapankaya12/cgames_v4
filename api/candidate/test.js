module.exports = (req, res) => { res.json({ test: "candidate endpoint works", timestamp: new Date().toISOString() }); };
