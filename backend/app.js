import express from "express";
import cors from "cors";
import { connectDB } from "./DB/Database.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import transactionRoutes from "./Routers/Transactions.js";
import userRoutes from "./Routers/userRouter.js";
import aiRoutes from "./Routers/aiRouter.js";

dotenv.config({ path: "./.env" });
const app = express();

const port = process.env.PORT || 3001;

connectDB();
connectDB().catch((err) => {
  console.error(`MongoDB connection failed: ${err.message}`);
});

const allowedOrigins = [
  "http://localhost:3000",
  "https://iiitl-bachat.vercel.app",
  "https://iiitl-bachat-git-main-khushal-midhas-projects.vercel.app",
  "https://iiitl-bachat-khushal-midhas-projects.vercel.app"
  // add more origins as needed
];

// Middleware
app.use(express.json({ limit: "12mb" }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "12mb" }));


app.use(bodyParser.urlencoded({ extended: false }));

// Router
app.use("/api/v1", transactionRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
