package com.ives.api.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRateResult {
    private String thsCode;
    private String chineseName;
    private String sector;
    private String startDate;
    private String endDate;
    private java.math.BigDecimal startAdjustedNav;
    private java.math.BigDecimal endAdjustedNav;
    private java.math.BigDecimal returnRate;
    private String returnRatePercent;
    private String error;
    private Integer status;

    public static ReturnRateResult error(String thsCode, String error) {
        ReturnRateResult result = new ReturnRateResult();
        result.setThsCode(thsCode);
        result.setError(error);
        result.setStatus(404);
        return result;
    }
}
