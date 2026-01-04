package com.ives.api.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DailyReturnRate {
    private String startDate;
    private String endDate;
    private Integer validEtfCount;
    private java.math.BigDecimal avgReturnRate;
    private String avgReturnRatePercent;
    private String error;
    private List<EtfReturnDetail> etfDetails;
}
