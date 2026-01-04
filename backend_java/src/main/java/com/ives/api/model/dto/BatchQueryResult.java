package com.ives.api.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BatchQueryResult {
    private Integer sectorsCount;
    private String queryDate;
    private Integer tradingDaysCount;
    private Map<String, SectorHistoryResult> results;
}
