package com.ives.api.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectorReturnResult {
    private String sector;
    private String category_name;
    private Integer count;
    private Integer valid_count;
    private java.math.BigDecimal avg_return_rate;
    private String avg_return_rate_percent;
}
