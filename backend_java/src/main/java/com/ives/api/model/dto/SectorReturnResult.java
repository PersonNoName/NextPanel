package com.ives.api.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectorReturnResult {
    private String sector;
    private String categoryName;
    private Integer count;
    private Integer validCount;
    private java.math.BigDecimal avgReturnRate;
    private String avgReturnRatePercent;
}
