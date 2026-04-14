import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import expenseRoutes from "./routes/expense.js";
import approvalRoutes from "./routes/approval.js";
import authRoutes from "./routes/auth.js";
import connectDB from "./db/connectdb.js";
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Configure allowed origins from env (comma-separated) with sensible defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  : ["https://main.d2jc1kamdtvhjd.amplifyapp.com", "http://localhost:3000"];

// Simple CORS configuration - allows all origins with credentials
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(helmet());

app.use(express.json({ limit: "10mb" })); // Limit JSON payload size
app.use(cookieParser()); // Parse cookies

// Basic security middleware

// Routes
app.use("/api/v1/approvals", approvalRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/auth", authRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;
const start = async () => {
  try {
    const mongoUri = process.env.MONGO_URI?.trim();
    if (!mongoUri) {
      console.error(
        "Set MONGO_URI in server/.env (copy from .env.example). Get a connection string from MongoDB Atlas → Database → Connect.",
      );
      process.exit(1);
    }
    await connectDB(mongoUri);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

// Export app for testing purposes
export default app;

// Only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  start();
}
