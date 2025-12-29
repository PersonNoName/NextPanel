package com.ives.api.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("category")
//@Schema(description = "类别实体类")
public class Category implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 类别唯一标识（自增主键）
     */
    @TableId(value = "cid", type = IdType.AUTO)
//    @Schema(description = "类别ID")
    private Integer cid;

    /**
     * 类别名称（如“科技”“体育”）
     */
    @TableField("name")
//    @Schema(description = "类别名称")
    private String name;

    /**
     * 类别描述（可选，说明该类别的内容）
     */
    @TableField("description")
//    @Schema(description = "类别描述")
    private String description;

    /**
     * 排序权重（数值越大越靠前，用于前端展示排序）
     */
    @TableField("sort_order")
//    @Schema(description = "排序权重")
    private Integer sortOrder;

    /**
     * 状态：1-启用，0-禁用（逻辑删除，避免物理删除影响历史收藏）
     */
    @TableField("status")
//    @Schema(description = "状态：1-启用，0-禁用")
    private Integer status;

    /**
     * 类别创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
//    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    /**
     * 类别更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
//    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;

    /**
     * 该类别包含的记录数量
     */
    @TableField("item_count")
//    @Schema(description = "记录数量")
    private Integer itemCount;
}
