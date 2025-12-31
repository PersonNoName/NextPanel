package com.ives.api.model.dto;

import lombok.Data;

import java.util.List;

@Data
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