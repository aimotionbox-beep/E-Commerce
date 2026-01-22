import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

/* =========================
   MANUAL CORS (RENDER SAFE)
========================= */

app.use((req, res, next) => {
  const allowedOrigins = [
    "https://style-x-p0qu.onrender.com",
    "https://style-x-admin.onrender.com/",
    "http://localhost:3000",
    "http://localhost:5173",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // ✅ HANDLE PREFLIGHT HERE
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* ========================= */

app.use(express.json());

// routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () =>
  console.log("Server started on PORT : " + port)
);
