import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { URI, port } from './config.mjs';
import router from './src/routes/route.mjs';

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('netlify.app')) {
      return callback(null, true);
    }
    
    console.warn(`Origin blocked by CORS: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(URI)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

app.use('/', router);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(port || 8080, () => {
  console.log(`Server started on port ${port || 8080}`);
});
