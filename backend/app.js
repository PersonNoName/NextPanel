require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const etfRoutes = require('./routes/etfRoutes');
const dateRoutes = require('./routes/dateRoutes');
const etfCollectRoutes = require('./routes/etfCollectRoutes');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const app = express();

app.use(helmet())
app.use(cors(
  config.cors
))
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb'}));

// 请求日志中间件（开发环境）
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  });
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 1000, // 每个 IP 每 15 分钟最多请求 100 次
  message: {
    message: '请求次数过多，请稍后再试',
    success: false
  },
  standHeaders: true,
  legacyHeaders: true,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: '请求次数过多，请稍后再试'
  },
  skipSuccessfulRequests: true,
})

// app.use('/api/', limiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/etf', limiter, etfRoutes);
app.use('/api/etf-collect', limiter, etfCollectRoutes);
app.use('/api/trading-days',limiter, dateRoutes);


// 404 错误处理（简化版）
app.use(function(req, res, next) {
  res.status(404).json({ error: 'Not Found' }); // 直接返回 JSON 错误
});

// 404 handler
app.use((req, res) => {
  errorResponse(res, 404, 'Route not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  errorResponse(res, 500, 'Internal server error');
});

module.exports = app;