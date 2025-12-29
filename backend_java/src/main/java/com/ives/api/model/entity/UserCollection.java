package com.ives.api.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("user_collection")
public class UserCollection implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 收藏记录唯一标识
     */
    @TableId(value = "collect_id", type = IdType.AUTO)
    private Integer collectId;

    /**
     * 关联的用户ID（外键）
     */
    @TableField("user_id")
    private Integer userId;

    /**
     * 兴趣类别标识（外键）
     */
    @TableField("cid")
    private Integer cid;

    /**
     * 收藏时间
     */
    @TableField(value = "collect_time", fill = FieldFill.INSERT)
    private LocalDateTime collectTime;
}