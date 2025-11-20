module.exports = function (req, res, next) {
  const expected = process.env.FRONTEND_SECRET;
  const incoming = req.headers["x-frontend-secret"];

  if (!expected) {
    console.warn("⚠️ No FRONTEND_SECRET configured — skipping check.");
    return next();
  }

  if (!incoming || incoming !== expected) {
    console.warn("🚫 Unauthorized frontend access attempt");
    return res.status(403).json({ error: "Unauthorized" });
  }

  next();
};
