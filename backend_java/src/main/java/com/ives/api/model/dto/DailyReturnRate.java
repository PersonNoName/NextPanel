package com.ives.api.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyReturnRate {
    private String startDate;
    private String endDate;
    private Integer validEtfCount;
    private java.math.BigDecimal avgReturnRate;
    private String avgReturnRatePercent;
    private String error;
    private List<EtfReturnDetail> etfDetails;
}
