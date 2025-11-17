import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

// Connect DB & Cloudinary
await connectDB();
await connectCloudinary();

// Allowed origins logic
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL // Example: https://main.xxxxxx.amplifyapp.com
].filter(Boolean);

// Stripe route MUST be defined BEFORE express.json()
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS
app.use(cors({
  origin: function(origin, callback) {
    // allow requests without origin (mobile apps, curl, postman, backend)
    if (!origin) return callback(null, true);

    // allow any amplify domain dynamically
    if (/\.amplifyapp\.com$/.test(origin)) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Routes
app.get('/', (req, res) => res.send("API is Working"));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
