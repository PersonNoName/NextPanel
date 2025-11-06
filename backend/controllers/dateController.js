const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const Calendar = require('../models/calendar');

/**
 * 获取给定日期前n个交易日
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPreviousTradingDays = async (req, res) => {
  try {
    const { date, n } = req.query;

    // 验证输入参数
    if (!date || !n) {
      return errorResponse(res, 400, 'Missing required parameters: date and n');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return errorResponse(res, 400, 'Invalid date format, should be YYYY-MM-DD');
    }

    const targetDate = date.replace(/-/g, '');
    const daysCount = parseInt(n);
    
    if (isNaN(daysCount) || daysCount <= 0) {
      return errorResponse(res, 400, 'Parameter n must be a positive integer');
    }

    // 查找目标日期在日历中的记录
    let endTradingDay = await Calendar.findOne({
      where: { Day: targetDate }
    });

    if (!endTradingDay) {
      return errorResponse(res, 404, `Date ${date} not found in calendar`);
    }

    // 如果目标日期不是交易日，向前查找最近的交易日作为结束日期
    if (endTradingDay.IsTradingDay === 0) {
      endTradingDay = await Calendar.findOne({
        where: {
          Day: { [Op.lt]: targetDate },
          IsTradingDay: 1
        },
        order: [['Day', 'DESC']]
      });

      if (!endTradingDay) {
        return errorResponse(res, 404, 'No trading day found');
      }
    }

    // 查找包含结束日期在内的n个交易日
    const tradingDays = await Calendar.findAll({
      where: {
        Day: { [Op.lte]: endTradingDay.Day },  // 包含结束日期
        IsTradingDay: 1
      },
      order: [['Day', 'DESC']],
      limit: daysCount
    });

    // 如果交易日数量不足
    if (tradingDays.length < daysCount) {
      return errorResponse(res, 404, `Not enough trading days found. Required: ${daysCount}, Found: ${tradingDays.length}`);
    }

    // 按时间顺序排序（从早到晚）
    tradingDays.sort((a, b) => a.Day.localeCompare(b.Day));

    const formatDate = (dateStr) => {
      return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    };

    const result = {
      startDate: formatDate(tradingDays[0].Day),
      endDate: formatDate(tradingDays[tradingDays.length - 1].Day),
      tradingDaysCount: tradingDays.length,
      tradingDays: tradingDays.map(day => formatDate(day.Day)), // 可选：返回所有交易日日期
      originalInput: {
        date: date,
        n: daysCount
      }
    };

    return successResponse(res, 200, 'Trading days retrieved successfully', result);

  } catch (error) {
    console.error('Get previous trading days error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

module.exports = {
  getPreviousTradingDays
};