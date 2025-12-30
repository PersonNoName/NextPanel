package com.ives.api.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ives.api.common.exception.BusinessException;
import com.ives.api.model.dto.TradingDaysResponse;
import com.ives.api.model.entity.Calendar;

public interface CalendarService extends IService<Calendar> {
    /**
     * 获取给定日期前n个交易日
     * @param date 目标日期，格式：YYYY-MM-DD
     * @param n 交易日数量
     * @return 交易日信息
     */
    TradingDaysResponse getPreviousTradingDays(String date, int n) throws BusinessException;
}
