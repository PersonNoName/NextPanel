package com.ives.api.model.dto;

import lombok.Data;

@Data
public class MultipleSectorsReturnRateHistoryResponse {
    private Integer sectorsCount;
    private String queryDate;
    private Integer tradingDaysCount;
    private java.util.Map<String, SectorHistoryResult> results;
    private PerformanceInfo performance;
}