const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import database connection
const { connectDB, testConnection, closeConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');
const sellerRoutes = require('./routes/seller');
const sliderRoutes = require('./routes/slider');
const categoryRoutes = require('./routes/category');
const brandRoutes = require('./routes/brand');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { protect, adminOnly } = require('./middleware/auth');
const fileUpload = require('express-fileupload');
const { uploadImage } = require('./controllers/uploadController');

const app = express();
const localUploadsDir = path.join(__dirname, 'public/uploads');
const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : localUploadsDir;

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGIN || '').split(','),
  ...(process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:3000', 'http://127.0.0.1:3000']),
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, !origin || allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  const origin = req.get('origin');
  const isStateChangingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

  if (origin && isStateChangingMethod && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Origin is not allowed to perform this request',
    });
  }

  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// API rate limiting for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));
if (uploadsDir !== localUploadsDir) {
  app.use('/uploads', express.static(localUploadsDir));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const databaseConnected = await testConnection();
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'OK' : 'DEGRADED',
    message: databaseConnected ? 'Watch Store API is ready' : 'Database is unavailable',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: databaseConnected ? 'connected' : 'unavailable',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
// Register upload route on app so POST /api/admin/upload is matched (router was not matching)
app.post(
  '/api/admin/upload',
  protect,
  adminOnly,
  fileUpload({
    createParentPath: true,
    abortOnLimit: true,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  }),
  uploadImage
);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Premium Watch Store API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      brands: '/api/brands',
      cart: '/api/cart',
      wishlist: '/api/wishlist',
      orders: '/api/orders',
      admin: '/api/admin'
    }
  });
});

// Handle 404 errors
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Connect to database and start server
const PORT = process.env.PORT || 5000;
let server;
let isShuttingDown = false;

const connectWithRetry = async () => {
  let retryDelay = 1000;

  while (!isShuttingDown) {
    try {
      await connectDB();
      console.log('📊 Database connected successfully');
      return;
    } catch (error) {
      console.error(`❌ Database connection failed: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      retryDelay = Math.min(retryDelay * 2, 30000);
    }
  }
};

const shutdown = (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} signal received: closing HTTP server`);

  const closeServer = server
    ? new Promise((resolve) => server.close(resolve))
    : Promise.resolve();

  closeServer
    .then(() => closeConnection())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Graceful shutdown failed:', error.message);
      process.exit(1);
    });
};

const startServer = () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      const requiredEnv = [
        'FRONTEND_URL',
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'EMAIL_HOST',
        'EMAIL_USER',
        'EMAIL_PASS',
      ];
      const missingEnv = requiredEnv.filter((name) => !process.env[name]?.trim());
      if (missingEnv.length) {
        throw new Error(`Missing required production environment variables: ${missingEnv.join(', ')}`);
      }

      if (process.env.JWT_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32) {
        throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must each be at least 32 characters long.');
      }
      if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different values.');
      }
    }

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔗 API available at http://localhost:${PORT}`);
      }
    });

    server.on('error', (error) => {
      console.error(`❌ Server error: ${error.message}`);
      if (error.syscall === 'listen') {
        process.exit(1);
      }
    });

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    void connectWithRetry();
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exitCode = 1;
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  // Don't exit in development, just log the error
  if (process.env.NODE_ENV === 'production') {
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = app;
