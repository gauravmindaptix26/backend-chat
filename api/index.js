export default function handler(req, res) {
  res.status(200).json({
    message: "Backend is live 🚀",
    routes: {
      health: "/api/health",
      token: "/api/token?userID=test123"
    }
  });
}
