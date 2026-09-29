import "dotenv/config";
import express from "express";
import emailRoutes from "./routes/email.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "AI-Powered Email Template Generator",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", emailRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});