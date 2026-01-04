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
public class EtfReturnRateResponse {
    private Integer total;
    private Integer successCount;
    private Integer failCount;
    private List<ReturnRateResult> results;
}
