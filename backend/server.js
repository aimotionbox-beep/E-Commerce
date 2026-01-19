import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import path from "path";

const app = express();
const port = process.env.PORT || 4000;

// ✅ 1. CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://style-x-admin.onrender.com",
    ],
    credentials: true,
  })
);

// ✅ 2. Body parser
app.use(express.json());

// ✅ DB & cloud
connectDB();
connectCloudinary();

// ✅ 3. API routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ===================================================
// ✅ 4. Serve frontend ONLY in production
// ===================================================
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();

  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "frontend", "dist", "index.html")
    );
  });
}

// ===================================================

app.listen(port, () =>
  console.log("Server started on PORT : " + port)
);
