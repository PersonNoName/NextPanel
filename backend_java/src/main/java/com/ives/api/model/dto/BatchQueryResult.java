package com.ives.api.model.dto;

import lombok.Data;

import java.util.Map;

@Data
public class BatchQueryResult {
    private Integer sectorsCount;
    private String queryDate;
    private Integer tradingDaysCount;
    private Map<String, SectorHistoryResult> results;
}
