const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const EtfNetasset = require('../models/etfNetasset');
const EtfInfo = require('../models/etfInfo'); // 引入etf_info表模型
const Category = require('../models/category'); // 引入category表模型

/**
 * 按股票代码列表计算收益率（保留原功能）
 */
const getEtfReturnRateByCodes = async (req, res) => {
  try {
    const { thsCodeList, start_date, end_date } = req.body;
    
    if (!thsCodeList || !start_date || !end_date) {
      return errorResponse(res, 400, 'thsCodeList、start_date和end_date为必填参数');
    }
    
    if (!Array.isArray(thsCodeList)) {
      return errorResponse(res, 400, 'thsCodeList必须为数组格式');
    }
    
    const validCodeList = [...new Set(thsCodeList.filter(code => code && typeof code === 'string'))];
    
    if (validCodeList.length === 0) {
      return errorResponse(res, 400, 'thsCodeList数组中无有效代码');
    }
    
    const results = [];
    
    for (const code of validCodeList) {
      const [startData, endData, etfInfo] = await Promise.all([
        EtfNetasset.findOne({
          where: {
            ths_code: code.trim(),
            time: start_date
          },
          attributes: ['time', 'adjusted_nav']
        }),
        EtfNetasset.findOne({
          where: {
            ths_code: code.trim(),
            time: end_date
          },
          attributes: ['time', 'adjusted_nav']
        }),
        EtfInfo.findOne({
          where: { ths_code: code.trim() },
          attributes: ['sector', 'chinese_name']
        })
      ]);
      
      if (!startData) {
        results.push({
          ths_code: code,
          error: `未找到${start_date}的净值数据`,
          status: 404
        });
        continue;
      }
      
      if (!endData) {
        results.push({
          ths_code: code,
          error: `未找到${end_date}的净值数据`,
          status: 404
        });
        continue;
      }
      
      const startNav = startData.adjusted_nav;
      const endNav = endData.adjusted_nav;
      
      if (startNav <= 0) {
        results.push({
          ths_code: code,
          error: `起始日净值不能为零或负数`,
          status: 400
        });
        continue;
      }
      
      const returnRate = (endNav - startNav) / startNav;
      
      results.push({
        ths_code: code,
        chinese_name: etfInfo?.chinese_name || '未知名称',
        sector: etfInfo?.sector || '未知类别',
        start_date: startData.time,
        end_date: endData.time,
        start_adjusted_nav: startNav,
        end_adjusted_nav: endNav,
        return_rate: returnRate,
        return_rate_percent: (returnRate * 100).toFixed(2) + '%'
      });
    }
    
    return successResponse(res, 200, '收益率计算成功', {
      total: validCodeList.length,
      success_count: results.filter(item => !item.error).length,
      fail_count: results.filter(item => item.error).length,
      results
    });
  } catch (error) {
    console.error('计算ETF收益率时出错:', error);
    return errorResponse(res, 500, '服务器错误，无法计算收益率');
  }
};

/**
 * 按类别计算平均收益率
 */
const getReturnRateBySectors = async (req, res) => {
  try {
    const { sectorList, start_date, end_date, includeDetails = false } = req.body;
    
    // 参数校验
    if (!start_date || !end_date) {
      return errorResponse(res, 400, 'start_date和end_date为必填参数');
    }
    
    // 构建查询条件
    const sectorWhere = sectorList && Array.isArray(sectorList) && sectorList.length > 0
      ? { sector: { [Op.in]: sectorList } }
      : {};
    
    // 获取符合条件的股票及其类别信息
    const etfList = await EtfInfo.findAll({
      where: sectorWhere,
      attributes: ['ths_code', 'chinese_name', 'sector'],
      raw: true
    });
    
    if (etfList.length === 0) {
      return successResponse(res, 200, '未找到符合条件的ETF数据', {
        total: 0,
        sector_results: [],
        details: []
      });
    }
    
    const thsCodeList = etfList.map(etf => etf.ths_code);
    const sectorAccumulator = {}; // 改为对象结构，便于按类别累加
    const details = [];
    
    // 批量查询起始日和结束日的净值数据
    const [startDateData, endDateData] = await Promise.all([
      EtfNetasset.findAll({
        where: {
          ths_code: { [Op.in]: thsCodeList },
          time: start_date
        },
        attributes: ['ths_code', 'time', 'adjusted_nav'],
        raw: true
      }),
      EtfNetasset.findAll({
        where: {
          ths_code: { [Op.in]: thsCodeList },
          time: end_date
        },
        attributes: ['ths_code', 'time', 'adjusted_nav'],
        raw: true
      })
    ]);
    
    // 转换为Map便于查询
    const startDataMap = new Map(startDateData.map(item => [item.ths_code, item]));
    const endDataMap = new Map(endDateData.map(item => [item.ths_code, item]));
    
    // 处理每只股票的数据
    for (const etf of etfList) {
      const { ths_code, chinese_name, sector } = etf;
      const startData = startDataMap.get(ths_code);
      const endData = endDataMap.get(ths_code);
      
      if (!startData) {
        details.push({
          ths_code,
          chinese_name,
          sector,
          error: `未找到${start_date}的净值数据`,
          status: 404
        });
        continue;
      }
      
      if (!endData) {
        details.push({
          ths_code,
          chinese_name,
          sector,
          error: `未找到${end_date}的净值数据`,
          status: 404
        });
        continue;
      }
      
      const startNav = startData.adjusted_nav;
      const endNav = endData.adjusted_nav;
      
      if (startNav <= 0) {
        details.push({
          ths_code,
          chinese_name,
          sector,
          error: `起始日净值不能为零或负数`,
          status: 400
        });
        continue;
      }
      
      const returnRate = (endNav - startNav) / startNav;
      const resultItem = {
        ths_code,
        chinese_name,
        sector,
        start_date: startData.time,
        end_date: endData.time,
        start_adjusted_nav: startNav,
        end_adjusted_nav: endNav,
        return_rate: returnRate,
        return_rate_percent: (returnRate * 100).toFixed(2) + '%'
      };
      
      details.push(resultItem);
      
      // 按类别累加数据 - 修正逻辑
      if (!sectorAccumulator[sector]) {
        sectorAccumulator[sector] = {
          count: 1,
          total_return_rate: returnRate,
          valid_count: 1
        };
      } else {
        sectorAccumulator[sector].count += 1;
        sectorAccumulator[sector].total_return_rate += returnRate;
        sectorAccumulator[sector].valid_count += 1;
      }
    }
    
    // 获取所有相关类别信息，减少数据库查询次数
    const uniqueSectors = Object.keys(sectorAccumulator);
    const categories = await Category.findAll({
      where: { 
        name: { [Op.in]: uniqueSectors }
      },
      attributes: ['name', 'description'],
      raw: true
    });
    
    const categoryMap = new Map(categories.map(cat => [cat.name, cat]));
    
    // 计算每个类别的平均收益率
    const sectorResults = Object.entries(sectorAccumulator).map(([sector, data]) => {
      const avgReturnRate = data.total_return_rate / data.valid_count;
      const categoryInfo = categoryMap.get(sector);
      
      return {
        sector: sector,
        category_name: categoryInfo?.description || sector, // 使用description作为显示名称
        count: data.count,
        valid_count: data.valid_count,
        avg_return_rate: avgReturnRate,
        avg_return_rate_percent: (avgReturnRate * 100).toFixed(2) + '%'
      };
    });
    
    // 按收益率排序（从高到低）
    sectorResults.sort((a, b) => b.avg_return_rate - a.avg_return_rate);
    
    const responseData = {
      total_sectors: sectorResults.length,
      total_etfs: etfList.length,
      valid_etfs: details.filter(item => !item.error).length,
      sector_results: sectorResults
    };
    
    // 可选返回详细数据
    if (includeDetails) {
      responseData.details = details;
    }
    
    return successResponse(res, 200, '类别收益率计算成功', responseData);
  } catch (error) {
    console.error('按类别计算ETF收益率时出错:', error);
    return errorResponse(res, 500, '服务器错误，无法计算类别收益率');
  }
};

/**
 * 获取所有可用类别
 */
const getAvailableSectors = async (req, res) => {
  try {
    // 从category表获取所有启用的类别
    const categories = await Category.findAll({
      where: { status: 1 },
      attributes: ['cid', 'name', 'description', 'sort_order', 'item_count'],
      order: [['sort_order', 'ASC']], // 改为ASC，通常较小的sort_order排在前面
      raw: true
    });
    
    // 补充每个类别的股票数量
    const result = await Promise.all(categories.map(async (category) => {
      // const count = await EtfInfo.count({
      //   where: { sector: category.name }
      // });
      
      return {
        cid: category.cid,
        sector: category.name, // 明确字段名
        description: category.description,
        sort_order: category.sort_order,
        etf_count: category.item_count || 0 // 使用预计算的item_count字段
      };
    }));
    
    return successResponse(res, 200, '获取类别列表成功', {
      total: result.length,
      sectors: result
    });
  } catch (error) {
    console.error('获取类别列表时出错:', error);
    return errorResponse(res, 500, '服务器错误，无法获取类别列表');
  }
};

module.exports = { 
  getEtfReturnRateByCodes,
  getReturnRateBySectors,
  getAvailableSectors
};
