package com.ives.api.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class SectorReturnRateHistoryResponse {
    private String sector;
    private String sectorDescription;
    private String queryDate;
    private String actualEndDate;
    private Integer requestedCount;
    private Integer actualCount;
    private Integer totalEtfs;
    private List<DailyReturnRate> returnRateHistory;
}