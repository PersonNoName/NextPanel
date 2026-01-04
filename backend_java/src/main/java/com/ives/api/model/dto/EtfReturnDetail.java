package com.ives.api.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EtfReturnDetail {
    private String thsCode;
    private String chineseName;
    private java.math.BigDecimal prevNav;
    private java.math.BigDecimal currNav;
    private java.math.BigDecimal returnRate;
    private String returnRatePercent;
}
