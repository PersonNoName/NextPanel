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
 * ETF净值数据表
 * </p>
 */
@Data
@TableName("etf_netasset")
//@Schema(description = "ETF净值数据实体类")
public class EtfNetasset implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 同花顺代码（复合主键的一部分）
     */
    @TableId(value = "ths_code", type = IdType.INPUT)
//    @Schema(description = "同花顺代码")
    private String thsCode;

    /**
     * 日期（复合主键的一部分）
     */
    @TableId(value = "time", type = IdType.INPUT)
//    @Schema(description = "日期")
    private LocalDate time;

    /**
     * 单位净值
     */
    @TableField("net_asset_value")
//    @Schema(description = "单位净值")
    private Float netAssetValue;

    /**
     * 复权单位净值
     */
    @TableField("adjusted_nav")
//    @Schema(description = "复权单位净值")
    private Float adjustedNav;

    /**
     * 累计单位净值
     */
    @TableField("accumulated_nav")
//    @Schema(description = "累计单位净值")
    private Float accumulatedNav;

    /**
     * 贴水
     */
    @TableField("premium")
//    @Schema(description = "贴水")
    private Float premium;

    /**
     * 贴水率
     */
    @TableField("premium_ratio")
//    @Schema(description = "贴水率")
    private Float premiumRatio;
}
