package com.ives.api.model.dto;

import lombok.Data;

import java.util.Map;

@Data
public class PerformanceInfo {
    private Long responseTimeMs;
    private Integer sectorsQueried;
    private Integer tradingDays;
    private Map<String, Long> detailedTiming;
}