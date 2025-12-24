import express from "express";
import dotenv from "dotenv";
import health from "./api/health.js";
import token from "./api/token.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => health(req, res));
app.get("/api/token", (req, res) => token(req, res));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Local backend running: http://localhost:${PORT}`);
});
