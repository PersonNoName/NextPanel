package com.ives.api.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MultipleSectorsReturnRateHistoryResponse {
    private Integer sectorsCount;
    private String queryDate;
    private Integer tradingDaysCount;
    private java.util.Map<String, SectorHistoryResult> results;
    private PerformanceInfo performance;
}