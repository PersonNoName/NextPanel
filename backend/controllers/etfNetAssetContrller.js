const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const EtfNetasset = require('../models/etfNetasset');

/**
 * 获得某一天的 某一只股票的起始至结束之间的 ETF 净值数据
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEtfReturnRate = async (req, res) => {
  try {
    const { ths_code, start_date, end_date } = req.params;
    
    // 验证必要参数
    if (!ths_code || !start_date || !end_date) {
      return errorResponse(res, 400, 'ths_code、start_date和end_date为必填参数');
    }
    
    // 查询指定日期范围内的净值数据，并按日期排序
    const etfNetassets = await EtfNetasset.findAll({
      where: {
        ths_code,
        date: {
          [Op.between]: [start_date, end_date],
        },
      },
      order: [['date', 'ASC']], // 按日期升序排列
      attributes: ['date', 'adjusted_nav'], // 只获取需要的字段
    });
    
    // 检查是否有数据
    if (etfNetassets.length === 0) {
      return errorResponse(res, 404, '未找到指定日期范围内的ETF净值数据');
    }
    
    // 获取起始日和结束日的adjusted_nav
    const startNav = etfNetassets[0].adjusted_nav; // 最早日期的净值
    const endNav = etfNetassets[etfNetassets.length - 1].adjusted_nav; // 最晚日期的净值
    
    // 计算收益率
    const returnRate = (endNav - startNav) / startNav;
    
    // 整理返回结果
    const result = {
      ths_code,
      start_date: etfNetassets[0].date,
      end_date: etfNetassets[etfNetassets.length - 1].date,
      start_adjusted_nav: startNav,
      end_adjusted_nav: endNav,
      return_rate: returnRate, // 收益率（小数形式）
      return_rate_percent: (returnRate * 100).toFixed(2) + '%' // 收益率（百分比形式，保留两位小数）
    };
    
    return successResponse(res, 200, '收益率计算成功', result);
  } catch (error) {
    console.error('计算ETF收益率时出错:', error);
    return errorResponse(res, 500, '服务器错误，无法计算收益率');
  }
};

// const getEtfNetassetByDate = async (req, res) => {
//   try {
//     const { ths_code, date } = req.params;
//     const etfNetasset = await EtfNetasset.findOne({
//       where: {
//         ths_code,
//         date,
//       },
//     });
//     if (!etfNetasset) {
//       return errorResponse(res, 404, 'ETF 净值数据未找到');
//     }
//     return successResponse(res, 200, 'successfully', etfNetasset);
//   } catch (error) {
//     return errorResponse(res, 500, '服务器错误');
//   }
// };

module.exports = { 
    getEtfNetassetByDate 
};
