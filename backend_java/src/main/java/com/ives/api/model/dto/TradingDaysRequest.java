package com.ives.api.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TradingDaysRequest {
    @NotBlank(message = "日期不能为空")
    private String date;
    @NotBlank(message = "n不能为空")
    private int n;
}
