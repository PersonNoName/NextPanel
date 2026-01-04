package com.ives.api.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class SectorReturnRateResponse {
    private Integer total_sectors;
    private Integer total_etfs;
    private Integer valid_etfs;
    private List<SectorReturnResult> sector_results;
    private List<ReturnRateResult> details;

    public static SectorReturnRateResponse empty() {
        SectorReturnRateResponse response = new SectorReturnRateResponse();
        response.setTotal_sectors(0);
        response.setTotal_etfs(0);
        response.setValid_etfs(0);
        response.setSector_results(java.util.Collections.emptyList());
        return response;
    }
}