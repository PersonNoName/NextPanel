package com.ives.api.model.dto;

import lombok.Data;

@Data
public class EtfReturnDetail {
    private String thsCode;
    private String chineseName;
    private java.math.BigDecimal prevNav;
    private java.math.BigDecimal currNav;
    private java.math.BigDecimal returnRate;
    private String returnRatePercent;
}
