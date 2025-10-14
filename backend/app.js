// 只保留必要的核心依赖
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 导入路由（根据实际需求保留）
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// 保留必要的中间件
app.use(logger('dev')); // 日志中间件（可选，但推荐保留）
app.use(express.json()); // 解析 JSON 请求体（核心功能）
app.use(express.urlencoded({ extended: false })); // 解析表单请求体（核心功能）
app.use(cookieParser()); // 解析 Cookie（如果需要处理 Cookie 则保留，否则可移除）

// 路由配置（根据实际需求保留）
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404 错误处理（简化版）
app.use(function(req, res, next) {
  res.status(404).json({ error: 'Not Found' }); // 直接返回 JSON 错误
});

// 全局错误处理（简化版）
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    error: req.app.get('env') === 'development' ? err.message : 'Internal Server Error'
  });
});

module.exports = app;