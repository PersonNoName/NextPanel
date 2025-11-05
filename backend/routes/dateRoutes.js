const express = require('express');
const router = express.Router();
const dateController = require('../controllers/dateController');

/**
 * @route GET /api/trading-days/previous
 * @description 获取给定日期前n个交易日
 * @query {string} date - 目标日期 (格式: YYYY-MM-DD)
 * @query {number} n - 需要的交易日数量
 * @returns {Object} 包含起始日期和结束日期的对象
 */
router.get('/previous', dateController.getPreviousTradingDays);

module.exports = router;