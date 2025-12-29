package com.ives.api.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * <p>
 * ETF信息表
 * </p>
 */
@Data
@TableName("etf_info")
//@Schema(description = "ETF信息实体类")
public class EtfInfo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 同花顺代码（主键）
     */
    @TableId(value = "ths_code", type = IdType.INPUT)
//    @Schema(description = "同花顺代码")
    private String thsCode;

    /**
     * ETF中文名称
     */
    @TableField("chinese_name")
//    @Schema(description = "ETF中文名称")
    private String chineseName;

    /**
     * 起始日期
     */
    @TableField("start_day")
//    @Schema(description = "起始日期")
    private LocalDate startDay;

    /**
     * 结束日期
     */
    @TableField("end_day")
//    @Schema(description = "结束日期")
    private LocalDate endDay;

    /**
     * 所属板块/行业
     */
    @TableField("sector")
//    @Schema(description = "所属板块/行业")
    private String sector;
}
