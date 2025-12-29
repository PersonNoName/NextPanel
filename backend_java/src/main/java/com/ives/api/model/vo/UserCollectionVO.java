package com.ives.api.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户收藏视图对象（含完整类别信息）
 * 用于展示收藏记录及关联的类别详情
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
//@Schema(description = "用户收藏视图对象（含完整类别信息）")
public class UserCollectionVO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    // ---------------------- 收藏相关字段 ----------------------
//    @Schema(description = "收藏记录唯一标识")
    private Integer collectId;

//    @Schema(description = "关联的用户ID")
    private Integer userId;

//    @Schema(description = "收藏时间")
    private LocalDateTime collectTime;

    // ---------------------- 关联类别相关字段（加前缀区分） ----------------------
//    @Schema(description = "类别ID")
    private Integer categoryId; // 对应 Category.cid

//    @Schema(description = "类别名称（如\"科技\"\"体育\"）")
    private String categoryName; // 对应 Category.name

//    @Schema(description = "类别描述")
    private String categoryDescription; // 对应 Category.description

//    @Schema(description = "类别排序权重（数值越大越靠前）")
    private Integer categorySortOrder; // 对应 Category.sortOrder

//    @Schema(description = "类别状态：1-启用，0-禁用")
    private Integer categoryStatus; // 对应 Category.status

//    @Schema(description = "类别包含的记录数量")
    private Integer categoryItemCount; // 对应 Category.itemCount

//    @Schema(description = "类别创建时间", hidden = true) // 可选：前端不需要可隐藏
    private LocalDateTime categoryCreatedAt; // 对应 Category.createdAt

//    @Schema(description = "类别更新时间", hidden = true) // 可选：前端不需要可隐藏
    private LocalDateTime categoryUpdatedAt; // 对应 Category.updatedAt

    // ---------------------- 构造方法（方便组装VO） ----------------------
    // 简化构造（用于只展示核心字段的场景，如列表页）
    public UserCollectionVO(Integer collectId, Integer userId, LocalDateTime collectTime,
                            Integer categoryId, String categoryName, String categoryDescription) {
        this.collectId = collectId;
        this.userId = userId;
        this.collectTime = collectTime;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryDescription = categoryDescription;
    }
}