package com.ives.api.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class SectorReturnRateResponse {
    private Integer totalSectors;
    private Integer totalEtfs;
    private Integer validEtfs;
    private List<SectorReturnResult> sectorResults;
    private List<ReturnRateResult> details;

    public static SectorReturnRateResponse empty() {
        SectorReturnRateResponse response = new SectorReturnRateResponse();
        response.setTotalSectors(0);
        response.setTotalEtfs(0);
        response.setValidEtfs(0);
        response.setSectorResults(java.util.Collections.emptyList());
        return response;
    }
}