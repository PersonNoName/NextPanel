package com.ives.api.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("calendar")
public class Calendar implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 日期（格式：YYYYMMDD）- 业务主键
     */
    @TableId(
            value = "Day", // 对应数据库字段名
            type = IdType.INPUT // 主键类型：用户输入（非自增，由业务代码传入）
    )
    private String day;

    /**
     * 是否交易日（1=是，0=否）
     */
    @TableField("IsTradingDay") // 对应数据库字段名（数据库是驼峰，显式指定避免映射错误）
    private Boolean isTradingDay;

    /**
     * 是否工作日（1=是，0=否）
     */
    @TableField("IsWorkingDay")
    private Boolean isWorkingDay;

    /**
     * 备注（如节假日名称）
     */
    @TableField("Comments")
    private String comments;

    /**
     * 是否获取节假日（1=是，0=否）
     */
    @TableField("FetchHoliday")
    private Boolean fetchHoliday;

    /**
     * 更新时间（格式：yyyy-MM-dd HH:mm:ss 或其他字符串格式）
     */
    @TableField("UpdateTime")
    private String updateTime;

    // 说明：
    // 1. MP 不强制要求实体类名和表名一致，通过 @TableName 显式绑定更稳妥；
    // 2. 数据库字段是驼峰式（如 IsTradingDay），Java 字段是小驼峰（isTradingDay），必须用 @TableField(value = "数据库字段名") 显式映射（MP 默认下划线转驼峰，不匹配直接驼峰字段）；
    // 3. 主键类型 IdType.INPUT：表示主键由用户手动设置（如传入 "20251209"），而非数据库自增；
    // 4. Lombok 注解完全兼容 MP，不影响 CRUD 操作。

}
