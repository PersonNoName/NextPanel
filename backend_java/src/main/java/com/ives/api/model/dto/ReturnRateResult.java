package com.ives.api.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
// 全局配置：当前类所有字段仅非null时序列化（也可单独给字段加注解）
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReturnRateResult {
    private String thsCode;
    private String chineseName;
    private String sector;
    private String startDate;
    private String endDate;
    private BigDecimal startAdjustedNav;
    private BigDecimal endAdjustedNav;
    private BigDecimal returnRate;
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
