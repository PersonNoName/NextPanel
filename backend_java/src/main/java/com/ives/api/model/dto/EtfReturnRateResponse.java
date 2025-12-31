package com.ives.api.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EtfReturnRateResponse {
    private Integer total;
    private Integer successCount;
    private Integer failCount;
    private List<ReturnRateResult> results;
}
