package com.ives.api.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ives.api.model.entity.Calendar;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CalendarMapper extends BaseMapper<Calendar> {
    /**
     * 根据日期查询日历记录
     * @param day 日期（格式：YYYYMMDD）
     * @return 日历记录
     */
    Calendar findByDay(@Param("day") String day);

    /**
     * 查找指定日期之前的最近一个交易日
     * @param day 日期（格式：YYYYMMDD）
     * @return 日历记录
     */
    Calendar findPreviousTradingDay(@Param("day") String day);

    /**
     * 查找指定日期之前的N个交易日
     * @param day 结束日期（包含，格式：YYYYMMDD）
     * @param limit 交易日数量
     * @return 交易日列表（按日期降序排列）
     */
    List<Calendar> findPreviousNTradingDays(@Param("day") String day,
                                            @Param("limit") Integer limit);


}
