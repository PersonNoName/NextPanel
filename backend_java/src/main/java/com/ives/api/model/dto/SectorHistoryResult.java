package com.ives.api.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SectorHistoryResult {
    private String sectorDescription;
    private Integer totalEtfs;
    private String queryDate;
    private String actualEndDate;
    private Integer requestedCount;
    private Integer actualCount;
    private List<DailyReturnRate> returnRateHistory;
    private String error;
}