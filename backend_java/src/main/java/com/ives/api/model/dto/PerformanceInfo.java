package com.ives.api.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PerformanceInfo {
    private Long responseTimeMs;
    private Integer sectorsQueried;
    private Integer tradingDays;
    private Map<String, Long> detailedTiming;
}