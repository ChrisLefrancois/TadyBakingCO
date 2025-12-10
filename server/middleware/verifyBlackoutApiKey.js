// server/middleware/verifyBlackoutApiKey.js

module.exports = function verifyBlackoutApiKey(req, res, next) {
  const key = req.headers["x-api-key"];

  if (!key || key !== process.env.BLACKOUT_API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API key" });
  }

  next();
};
