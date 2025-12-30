package com.ives.api.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TradingDaysResponse {
    private String startDate;
    private String endDate;
    private int tradingDaysCount;
    private List<String> tradingDays;
    private TradingDaysRequest originalInput;
}
