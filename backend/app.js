require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth.routes')
const rateLimit = require('express-rate-limit');

// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// 导入路由（根据实际需求保留）
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// const { skipMiddlewareFunction } = require('mongoose');

const app = express();

app.use(helmet())
app.use(cors(
  {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
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
  max: 100, // 每个 IP 每 15 分钟最多请求 100 次
  message: {
    message: '请求次数过多，请稍后再试',
    success: false
  },
  standHeaders: true,
  legacyHeaders: true,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: '请求次数过多，请稍后再试'
  },
  skipSuccessfulRequests: true,
})

// app.use('/api/', limiter);
app.use('/api/auth', authLimiter, authRoutes);
// 保留必要的中间件
// app.use(logger('dev')); // 日志中间件（可选，但推荐保留）
// app.use(express.json()); // 解析 JSON 请求体（核心功能）
// app.use(express.urlencoded({ extended: false })); // 解析表单请求体（核心功能）
// app.use(cookieParser()); // 解析 Cookie（如果需要处理 Cookie 则保留，否则可移除）

// 404 错误处理（简化版）
app.use(function(req, res, next) {
  res.status(404).json({ error: 'Not Found' }); // 直接返回 JSON 错误
});

// 全局错误处理（简化版）
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500).json({
//     error: req.app.get('env') === 'development' ? err.message : 'Internal Server Error'
//   });
// });
app.use((err, req, res, next) => {
  console.error(err);

    // JWT错误处理
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: '无效的令牌'
    });
  }
  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: err.errors
    });
  }

    // 默认错误
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;