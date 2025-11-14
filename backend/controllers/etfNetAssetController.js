const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const EtfNetasset = require('../models/etfNetasset');
const EtfInfo = require('../models/etfInfo'); // 引入etf_info表模型
const Category = require('../models/category'); // 引入category表模型
const Calendar = require('../models/calendar');
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
/**
 * 查询n个连续交易日的类别平均收益率
 * 计算每个交易日相对于前一个交易日的收益率
 */
const getSectorReturnRateHistory = async (req, res) => {
  try {
    const { sector, date, n = 3, includeDetails = 'false' } = req.query;
    // 参数校验
    if (!sector) {
      return errorResponse(res, 400, 'sector为必填参数');
    }
    
    if (!date) {
      return errorResponse(res, 400, 'date为必填参数');
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return errorResponse(res, 400, '日期格式错误，应为YYYY-MM-DD');
    }
    
    const daysCount = parseInt(n);
    if (isNaN(daysCount) || daysCount <= 0) {
      return errorResponse(res, 400, 'n必须为正整数');
    }
    
    // 转换日期格式
    const targetDate = date.replace(/-/g, '');
    
    // 查找目标日期及其前n个交易日，共需要n+1个交易日
    let endTradingDay = await Calendar.findOne({
      where: { Day: targetDate }
    });
    
    if (!endTradingDay) {
      return errorResponse(res, 404, `日期${date}不在日历表中`);
    }
    
    // 如果目标日期不是交易日，向前查找最近的交易日
    if (endTradingDay.IsTradingDay === 0) {
      endTradingDay = await Calendar.findOne({
        where: {
          Day: { [Op.lt]: targetDate },
          IsTradingDay: 1
        },
        order: [['Day', 'DESC']]
      });
      
      if (!endTradingDay) {
        return errorResponse(res, 404, '未找到有效的交易日');
      }
    }
    
    // 查找包含结束日期在内的n+1个交易日（需要额外一天来计算第一个收益率）
    const tradingDays = await Calendar.findAll({
      where: {
        Day: { [Op.lte]: endTradingDay.Day },
        IsTradingDay: 1
      },
      order: [['Day', 'DESC']],
      limit: daysCount + 1
    });
    
    if (tradingDays.length < daysCount + 1) {
      return errorResponse(
        res, 
        404, 
        `交易日数量不足。需要${daysCount + 1}个，找到${tradingDays.length}个`
      );
    }
    
    // 按时间顺序排序（从早到晚）
    tradingDays.sort((a, b) => a.Day.localeCompare(b.Day));
    
    // 获取该类别下的所有ETF
    const etfList = await EtfInfo.findAll({
      where: { sector: sector },
      attributes: ['ths_code', 'chinese_name', 'sector'],
      raw: true
    });
    
    if (etfList.length === 0) {
      return errorResponse(res, 404, `未找到类别为"${sector}"的ETF数据`);
    }
    
    const thsCodeList = etfList.map(etf => etf.ths_code);
    
    // 格式化日期函数
    const formatDate = (dateStr) => {
      return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    };
    
    // 批量查询所有交易日的净值数据
    const allDates = tradingDays.map(day => formatDate(day.Day));
    const netAssetData = await EtfNetasset.findAll({
      where: {
        ths_code: { [Op.in]: thsCodeList },
        time: { [Op.in]: allDates }
      },
      attributes: ['ths_code', 'time', 'adjusted_nav'],
      raw: true
    });
    
    // 按日期分组净值数据
    const dataByDate = {};
    netAssetData.forEach(item => {
      if (!dataByDate[item.time]) {
        dataByDate[item.time] = {};
      }
      dataByDate[item.time][item.ths_code] = item.adjusted_nav;
    });
    
    // 计算每个交易日相对于前一个交易日的平均收益率
    const results = [];
    const shouldIncludeDetails = includeDetails === 'true';
    
    for (let i = 1; i < tradingDays.length; i++) {
      const prevDate = formatDate(tradingDays[i - 1].Day);
      const currDate = formatDate(tradingDays[i].Day);
      
      const prevData = dataByDate[prevDate] || {};
      const currData = dataByDate[currDate] || {};
      
      let totalReturnRate = 0;
      let validCount = 0;
      const etfDetails = shouldIncludeDetails ? [] : undefined;
      
      // 计算该类别中每只ETF的收益率
      for (const etf of etfList) {
        const { ths_code, chinese_name } = etf;
        const prevNav = prevData[ths_code];
        const currNav = currData[ths_code];
        
        if (prevNav && currNav && prevNav > 0) {
          const returnRate = (currNav - prevNav) / prevNav;
          totalReturnRate += returnRate;
          validCount += 1;
          
          if (shouldIncludeDetails) {
            etfDetails.push({
              ths_code,
              chinese_name,
              prev_nav: prevNav,
              curr_nav: currNav,
              return_rate: returnRate,
              return_rate_percent: (returnRate * 100).toFixed(2) + '%'
            });
          }
        }
      }
      
      const resultItem = {
        start_date: prevDate,
        end_date: currDate,
        valid_etf_count: validCount,
        avg_return_rate: validCount > 0 ? totalReturnRate / validCount : null,
        avg_return_rate_percent: validCount > 0 
          ? ((totalReturnRate / validCount) * 100).toFixed(2) + '%' 
          : 'N/A'
      };
      
      if (shouldIncludeDetails) {
        resultItem.etf_details = etfDetails;
      }
      
      if (validCount === 0) {
        resultItem.error = '该时间段内没有有效的ETF净值数据';
      }
      
      results.push(resultItem);
    }
    
    // 反转数组，使最新的数据在前
    results.reverse();
    
    // 获取类别信息
    const categoryInfo = await Category.findOne({
      where: { name: sector },
      attributes: ['name', 'description'],
      raw: true
    });
    
    const responseData = {
      sector: sector,
      sector_description: categoryInfo?.description || sector,
      query_date: date,
      actual_end_date: formatDate(tradingDays[tradingDays.length - 1].Day),
      requested_count: daysCount,
      actual_count: results.length,
      total_etfs: etfList.length,
      return_rate_history: results
    };
    
    return successResponse(
      res, 
      200, 
      '类别收益率历史查询成功', 
      responseData
    );
    
  } catch (error) {
    console.error('查询类别收益率历史时出错:', error);
    return errorResponse(res, 500, '服务器错误，无法查询类别收益率历史');
  }
};
const getMultipleSectorsReturnRateHistory = async (req, res) => {
  const overallStart = process.hrtime();
  const timing = {
    total: 0,
    calendar_query: 0,
    etf_info_query: 0,
    netasset_query: 0,
    calculation: 0,
    category_info_query: 0
  };
  try {
    const { sectors, date, n = 15, includeDetails = 'false', includeTiming = 'false' } = req.query;
    
    // 参数校验
    if (!sectors) {
      return errorResponse(res, 400, 'sectors为必填参数，多个类别用逗号分隔');
    }
    
    if (!date) {
      return errorResponse(res, 400, 'date为必填参数');
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return errorResponse(res, 400, '日期格式错误，应为YYYY-MM-DD');
    }
    
    const daysCount = parseInt(n);
    if (isNaN(daysCount) || daysCount <= 0) {
      return errorResponse(res, 400, 'n必须为正整数');
    }
    
    const sectorList = sectors.split(',').map(s => s.trim()).filter(s => s);
    if (sectorList.length === 0) {
      return errorResponse(res, 400, '至少提供一个有效的类别');
    }
    
    // 批量查询逻辑
    const startTime = process.hrtime();
    const results = await batchQuerySectorsReturnRate(
      sectorList, 
      date, 
      daysCount, 
      includeDetails === 'true',
      timing
    );
    // 计算总耗时
    const totalDiff = process.hrtime(overallStart);
    timing.total = (totalDiff[0] * 1e3 + totalDiff[1] * 1e-6).toFixed(2);

    // 构建响应数据
    const responseData = {
      ...results,
      performance: {
        response_time_ms: parseFloat(timing.total),
        sectors_queried: sectorList.length,
        trading_days: daysCount,
        ...(includeTiming === 'true' && {
          detailed_timing: {
            calendar_query_ms: parseFloat(timing.calendar_query),
            etf_info_query_ms: parseFloat(timing.etf_info_query),
            netasset_query_ms: parseFloat(timing.netasset_query),
            calculation_ms: parseFloat(timing.calculation),
            category_info_query_ms: parseFloat(timing.category_info_query)
          }
        })
      }
    };

    return successResponse(
      res, 
      200, 
      `批量查询成功，共${sectorList.length}个类别`, 
      responseData
    );
    
  } catch (error) {
    // 计算错误情况下的响应时间
    const totalDiff = process.hrtime(overallStart);
    timing.total = (totalDiff[0] * 1e3 + totalDiff[1] * 1e-6).toFixed(2);
    
    console.error('批量查询类别收益率历史时出错:', error);
    
    // 在错误响应中也包含响应时间
    const errorData = {
      error: error.message,
      performance: {
        response_time_ms: parseFloat(timing.total),
        error_occurred: true
      }
    };
    
    return res.status(500).json({
      success: false,
      message: '服务器错误，无法批量查询类别收益率历史',
      data: errorData
    });
  }
};

const batchQuerySectorsReturnRate = async (sectorList, date, daysCount, includeDetails, timing) => {
  let startTime;
  
  // 1. 统一查询交易日历（只查一次）
  startTime = process.hrtime();
  const tradingDays = await getTradingDays(date, daysCount);
  const calendarDiff = process.hrtime(startTime);
  timing.calendar_query = (calendarDiff[0] * 1e3 + calendarDiff[1] * 1e-6).toFixed(2);
  
  if (!tradingDays || tradingDays.length < daysCount + 1) {
    throw new Error(`交易日数量不足。需要${daysCount + 1}个，找到${tradingDays?.length || 0}个`);
  }
  
  // 2. 批量查询所有相关类别的ETF
  startTime = process.hrtime();
  const allEtfs = await EtfInfo.findAll({
    where: { 
      sector: { [Op.in]: sectorList }
    },
    attributes: ['ths_code', 'chinese_name', 'sector'],
    raw: true
  });
  const etfInfoDiff = process.hrtime(startTime);
  timing.etf_info_query = (etfInfoDiff[0] * 1e3 + etfInfoDiff[1] * 1e-6).toFixed(2);
  
  if (allEtfs.length === 0) {
    throw new Error(`未找到类别为${sectorList.join(',')}的ETF数据`);
  }
  
  // 按类别分组ETF
  const etfsBySector = {};
  allEtfs.forEach(etf => {
    if (!etfsBySector[etf.sector]) {
      etfsBySector[etf.sector] = [];
    }
    etfsBySector[etf.sector].push(etf);
  });
  
  // 3. 批量查询所有ETF的净值数据（一次查询）
  startTime = process.hrtime();
  const allDates = tradingDays.map(day => formatDate(day.Day));
  const allThsCodes = allEtfs.map(etf => etf.ths_code);
  
  const netAssetData = await EtfNetasset.findAll({
    where: {
      ths_code: { [Op.in]: allThsCodes },
      time: { [Op.in]: allDates }
    },
    attributes: ['ths_code', 'time', 'adjusted_nav'],
    raw: true
  });
  const netassetDiff = process.hrtime(startTime);
  timing.netasset_query = (netassetDiff[0] * 1e3 + netassetDiff[1] * 1e-6).toFixed(2);
  
  // 4. 构建净值数据索引
  const navDataIndex = {};
  netAssetData.forEach(item => {
    const key = `${item.ths_code}_${item.time}`;
    navDataIndex[key] = item.adjusted_nav;
  });
  
  // 5. 按类别并行计算收益率
  startTime = process.hrtime();
  const sectorResults = {};
  
  for (const sector of sectorList) {
    const sectorEtfs = etfsBySector[sector] || [];
    
    if (sectorEtfs.length === 0) {
      sectorResults[sector] = {
        error: `未找到类别"${sector}"的ETF数据`,
        total_etfs: 0,
        return_rate_history: []
      };
      continue;
    }
    
    const returnHistory = calculateSectorReturnHistory(
      sectorEtfs, 
      tradingDays, 
      navDataIndex, 
      includeDetails
    );
    
    // 获取类别描述信息
    const categoryStart = process.hrtime();
    const categoryInfo = await Category.findOne({
      where: { name: sector },
      attributes: ['description'],
      raw: true
    });
    const categoryDiff = process.hrtime(categoryStart);
    timing.category_info_query = (parseFloat(timing.category_info_query || 0) + 
      (categoryDiff[0] * 1e3 + categoryDiff[1] * 1e-6)).toFixed(2);
    
    sectorResults[sector] = {
      sector_description: categoryInfo?.description || sector,
      total_etfs: sectorEtfs.length,
      query_date: date,
      actual_end_date: formatDate(tradingDays[tradingDays.length - 1].Day),
      requested_count: daysCount,
      actual_count: returnHistory.length,
      return_rate_history: returnHistory
    };
  }
  
  const calculationDiff = process.hrtime(startTime);
  timing.calculation = (calculationDiff[0] * 1e3 + calculationDiff[1] * 1e-6).toFixed(2);
  
  return {
    sectors_count: sectorList.length,
    query_date: date,
    trading_days_count: tradingDays.length,
    results: sectorResults
  };
};

// 获取交易日历函数
const getTradingDays = async (date, daysCount) => {
  const targetDate = date.replace(/-/g, '');
  
  // 查找目标日期
  let endTradingDay = await Calendar.findOne({
    where: { Day: targetDate }
  });
  
  if (!endTradingDay) {
    throw new Error(`日期${date}不在日历表中`);
  }
  
  // 如果目标日期不是交易日，向前查找最近的交易日
  if (endTradingDay.IsTradingDay === 0) {
    endTradingDay = await Calendar.findOne({
      where: {
        Day: { [Op.lt]: targetDate },
        IsTradingDay: 1
      },
      order: [['Day', 'DESC']]
    });
    
    if (!endTradingDay) {
      throw new Error('未找到有效的交易日');
    }
  }
  
  // 查找包含结束日期在内的n+1个交易日
  const tradingDays = await Calendar.findAll({
    where: {
      Day: { [Op.lte]: endTradingDay.Day },
      IsTradingDay: 1
    },
    order: [['Day', 'DESC']],
    limit: daysCount + 1
  });
  
  if (tradingDays.length < daysCount + 1) {
    throw new Error(`交易日数量不足。需要${daysCount + 1}个，找到${tradingDays.length}个`);
  }
  
  // 按时间顺序排序（从早到晚）
  tradingDays.sort((a, b) => a.Day.localeCompare(b.Day));
  return tradingDays;
};

// 计算类别收益率历史
const calculateSectorReturnHistory = (sectorEtfs, tradingDays, navDataIndex, includeDetails) => {
  const results = [];
  
  for (let i = 1; i < tradingDays.length; i++) {
    const prevDate = formatDate(tradingDays[i - 1].Day);
    const currDate = formatDate(tradingDays[i].Day);
    
    let totalReturnRate = 0;
    let validCount = 0;
    const etfDetails = includeDetails ? [] : undefined;
    
    // 计算该类别中每只ETF的收益率
    for (const etf of sectorEtfs) {
      const { ths_code, chinese_name } = etf;
      const prevNav = navDataIndex[`${ths_code}_${prevDate}`];
      const currNav = navDataIndex[`${ths_code}_${currDate}`];
      
      if (prevNav && currNav && prevNav > 0) {
        const returnRate = (currNav - prevNav) / prevNav;
        totalReturnRate += returnRate;
        validCount += 1;
        
        if (includeDetails) {
          etfDetails.push({
            ths_code,
            chinese_name,
            prev_nav: prevNav,
            curr_nav: currNav,
            return_rate: returnRate,
            return_rate_percent: (returnRate * 100).toFixed(2) + '%'
          });
        }
      }
    }
    
    const resultItem = {
      start_date: prevDate,
      end_date: currDate,
      valid_etf_count: validCount,
      avg_return_rate: validCount > 0 ? totalReturnRate / validCount : null,
      avg_return_rate_percent: validCount > 0 
        ? ((totalReturnRate / validCount) * 100).toFixed(2) + '%' 
        : 'N/A'
    };
    
    if (includeDetails) {
      resultItem.etf_details = etfDetails;
    }
    
    if (validCount === 0) {
      resultItem.error = '该时间段内没有有效的ETF净值数据';
    }
    
    results.push(resultItem);
  }
  
  // 反转数组，使最新的数据在前
  results.reverse();
  return results;
};

// 格式化日期函数
const formatDate = (dateStr) => {
  if (dateStr.includes('-')) return dateStr; // 已经是格式化后的日期
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
};

module.exports = { 
  getEtfReturnRateByCodes,
  getReturnRateBySectors,
  getAvailableSectors,
  getSectorReturnRateHistory,
  getMultipleSectorsReturnRateHistory,
};
