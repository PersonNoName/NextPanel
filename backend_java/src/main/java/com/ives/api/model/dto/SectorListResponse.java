package com.ives.api.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SectorListResponse {
    // 总数量
    private Integer total;
    // 行业列表
    private List<SectorInfo> sectors;
}
