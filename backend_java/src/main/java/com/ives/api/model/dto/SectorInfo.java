package com.ives.api.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectorInfo {
    private Long cid;
    private String sector;
    private String description;
    private Integer sortOrder;
    private Integer etfCount;
}
