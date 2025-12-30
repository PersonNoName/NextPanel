package com.ives.api.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ives.api.common.exception.BusinessException;
import com.ives.api.mapper.CalendarMapper;
import com.ives.api.model.dto.TradingDaysRequest;
import com.ives.api.model.dto.TradingDaysResponse;
import com.ives.api.model.entity.Calendar;
import com.ives.api.service.CalendarService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;

@Service
public class CalendarServiceImpl extends ServiceImpl<CalendarMapper, Calendar> implements CalendarService {
    private static final String DATE_PATTERN = "yyyy-MM-dd";
    private static final String DATE_FORMAT_REGEX = "^\\d{4}-\\d{2}-\\d{2}$";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(DATE_PATTERN);
    private static final DateTimeFormatter DB_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final CalendarMapper calendarMapper;

    public CalendarServiceImpl(CalendarMapper calendarMapper) {
        this.calendarMapper = calendarMapper;
    }

    @Override
    public TradingDaysResponse getPreviousTradingDays(String date, int n) throws BusinessException {
        // 参数校验
        validateParams(date, n);

        // 格式化日期
        String targetDate = date.replace("-", "");

        // 查找目标日期记录
        Calendar endTradingDay = calendarMapper.findByDay(targetDate);

        if (endTradingDay == null) {
            throw new BusinessException(404, "Trading day not found for date: " + date);
        }

        // 如果目标日期不是交易日，向前查找最近的交易日
        if (endTradingDay.getIsTradingDay() == 0) {
            endTradingDay = calendarMapper.findPreviousTradingDay(targetDate);

            if (endTradingDay == null) {
                throw new BusinessException(404, "No trading day found");
            }
        }
        // 查找包含结束日期在内的n个交易日
        List<Calendar> tradingDays = calendarMapper.findPreviousNTradingDays(
                endTradingDay.getDay(),
                n
        );

        // 如果交易日数量不足
        if (tradingDays.size() < n) {
            throw new BusinessException(404,
                    String.format("Not enough trading days found. Required: %d, Found: %d",
                            n, tradingDays.size()));
        }
        // 按时间顺序排序（从早到晚）
        tradingDays.sort(Comparator.comparing(Calendar::getDay));

        return buildResponse(tradingDays, date, n);

    }

    private void validateParams(String date, Integer n) throws BusinessException {
        if (!StringUtils.hasText(date) || n == null) {
            throw new BusinessException(400, "Missing required parameters: date and n");
        }
        if (!date.matches(DATE_FORMAT_REGEX)){
            throw new BusinessException(400, "Invalid date format, should be YYYY-MM-DD");
        }

        try {
            LocalDate.parse(date, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new BusinessException(400, "Invalid date format, should be YYYY-MM-DD");
        }

        if (n <= 0) {
            throw new BusinessException(400, "Parameter n must be a positive integer");
        }
    }
    /**
     * 构建响应对象
     */
    private TradingDaysResponse buildResponse(List<Calendar> tradingDays,
                                              String originalDate,
                                              Integer originalN) {
        TradingDaysResponse response = new TradingDaysResponse();

        // 格式化日期
        List<String> formattedDays = tradingDays.stream()
                .map(day -> formatDate(day.getDay()))
                .toList();

        response.setStartDate(formattedDays.get(0));
        response.setEndDate(formattedDays.get(formattedDays.size() - 1));
        response.setTradingDaysCount(formattedDays.size());
        response.setTradingDays(formattedDays);

        response.setOriginalInput(new TradingDaysRequest(originalDate, originalN));
        return response;
    }

    /**
     * 格式化日期（YYYYMMDD -> YYYY-MM-DD）
     */
    private String formatDate(String dateStr) {
        if (dateStr.length() == 8) {
            return String.format("%s-%s-%s",
                    dateStr.substring(0, 4),
                    dateStr.substring(4, 6),
                    dateStr.substring(6, 8));
        }
        return dateStr;
    }
}
