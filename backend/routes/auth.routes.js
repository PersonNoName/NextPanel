// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
// 模拟数据库 - 实际项目中应使用真实数据库
const users = [];

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少6个字符')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('密码必须包含字母和数字'),
];

// 登录验证规则
const loginValidation = [
  body('email').trim().isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').notEmpty().withMessage('密码不能为空'),
];

// 注册接口
router.post('/register', registerValidation, async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: '用户名或邮箱已被注册' 
      });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    users.push(newUser);

    // 生成JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };

    res.status(201).json({
      success: true,
      message: '注册成功',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误，请稍后重试' 
    });
  }
});

// 登录接口
router.post('/login', loginValidation, async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // 查找用户
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: '邮箱或密码错误' 
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: '邮箱或密码错误' 
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    res.json({
      success: true,
      message: '登录成功',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误，请稍后重试' 
    });
  }
});

// 获取当前用户信息（需要认证）
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ 
      success: false,
      message: '用户不存在' 
    });
  }

  const userResponse = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  res.json({
    success: true,
    user: userResponse,
  });
});

// JWT认证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: '未提供认证令牌' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        message: '无效的令牌' 
      });
    }
    req.user = user;
    next();
  });
}

module.exports = router;
