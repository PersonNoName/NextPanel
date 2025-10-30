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

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return errorResponse(res, 400, 'Invalid date format, should be YYYY-MM-DD');
    }

    // 将日期转换为YYYYMMDD格式
    const targetDate = date.replace(/-/g, '');
    
    // 验证n为正整数
    const daysCount = parseInt(n);
    if (isNaN(daysCount) || daysCount <= 0) {
      return errorResponse(res, 400, 'Parameter n must be a positive integer');
    }

    // 查找目标日期在日历中的记录
    let targetDayRecord = await Calendar.findOne({
      where: { Day: targetDate }
    });

    if (!targetDayRecord) {
      return errorResponse(res, 404, `Date ${date} not found in calendar`);
    }

    let startTradingDay = targetDayRecord;

    // 如果目标日期不是交易日，向前查找最近的交易日
    if (targetDayRecord.IsTradingDay === 0) {
      const previousTradingDay = await Calendar.findOne({
        where: {
          Day: { [Op.lt]: targetDate },
          IsTradingDay: 1
        },
        order: [['Day', 'DESC']]
      });

      if (!previousTradingDay) {
        return errorResponse(res, 404, 'No previous trading day found');
      }

      startTradingDay = previousTradingDay;
    }

    // 查找前n-1个交易日（从起始交易日的前一天开始）
    const previousTradingDays = await Calendar.findAll({
      where: {
        Day: { [Op.lt]: startTradingDay.Day },
        IsTradingDay: 1
      },
      order: [['Day', 'DESC']],
      limit: daysCount - 1
    });

    // 组合所有交易日：起始交易日 + 前n-1个交易日
    const allTradingDays = [startTradingDay, ...previousTradingDays];
    
    // 如果交易日数量不足
    if (allTradingDays.length < daysCount) {
      return errorResponse(res, 404, `Not enough trading days found. Required: ${daysCount}, Found: ${allTradingDays.length}`);
    }

    // 按时间顺序排序（从早到晚）
    allTradingDays.sort((a, b) => a.Day.localeCompare(b.Day));

    // 提取需要的两个交易日
    const startDay = allTradingDays[0]; // 最早的交易日
    const endDay = allTradingDays[allTradingDays.length - 1]; // 最晚的交易日（起始交易日）

    // 格式化日期为YYYY-MM-DD
    const formatDate = (dateStr) => {
      return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    };

    const result = {
      startDate: formatDate(startDay.Day),
      endDate: formatDate(endDay.Day),
      tradingDaysCount: allTradingDays.length,
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