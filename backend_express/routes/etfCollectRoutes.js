const express = require('express');
const router = express.Router();
const etfCollectController = require('../controllers/etfCollectController')
const { authenticateToken } = require('../middlewares/auth');

// 获取当前已认证用户的收藏列表（后端从 token 获取用户 uid）
router.get('/', authenticateToken, etfCollectController.getUserCollections);

// 新增收藏s
router.post('/', authenticateToken, etfCollectController.addCollection);

// 删除收藏
router.delete('/:cid', authenticateToken, etfCollectController.removeCollection);

module.exports = router;