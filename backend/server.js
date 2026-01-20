import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

// App Config
const app = express();
const port = process.env.PORT || 4000;

// DB & Cloudinary
connectDB();
connectCloudinary();

// ✅ Allowed origins
const allowedOrigins = [
  'https://style-x-p0qu.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

// ✅ Middlewares (ORDER MATTERS)
app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ Handle preflight requests
app.options('*', cors());

// API routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// Health check
app.get('/', (req, res) => {
  res.send('API Working');
});

app.listen(port, () =>
  console.log('Server started on PORT : ' + port)
);
