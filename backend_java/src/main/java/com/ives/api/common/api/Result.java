package com.ives.api.common.api;

import com.ives.api.common.constant.ErrorCode;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Data
@NoArgsConstructor
public class Result<T> implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    /**
     * 状态码
     */
    private int code;

    /**
     * 响应信息
     */
    private String message;

    /**
     * 数据载荷
     */
    private T data;

    /**
     * 响应时间戳
     */
    private long timestamp;

    /**
     * 私有构造方法，强制使用静态工厂方法
     */
    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * 成功 - 无数据
     */
    public static <T> Result<T> success() {
        return success(null);
    }

    /**
     * 成功 - 带数据
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), data);
    }

    /**
     * 成功 - 自定义消息 (较少使用，但保留灵活性)
     */
    public static <T> Result<T> success(T data, String message) {
        return new Result<>(ErrorCode.SUCCESS.getCode(), message, data);
    }
    // ============================ 失败响应 ============================
    /**
     * 失败 - 使用默认的 ErrorCode
     * 用法: Result.error(ErrorCode.USER_NOT_FOUND)
     */
    public static <T> Result<T> error(ErrorCode errorCode) {
        return new Result<>(errorCode.getCode(), errorCode.getMessage(), null);
    }

    /**
     * 失败 - 使用 ErrorCode 但覆盖消息
     * 场景: 参数校验失败，Code是400，但Message需要是具体的"密码长度不够"
     * 用法: Result.error(ErrorCode.BAD_REQUEST, "密码长度不能少于6位")
     */
    public static <T> Result<T> error(ErrorCode errorCode, String message) {
        return new Result<>(errorCode.getCode(), message, null);
    }

    /**
     * 失败 - 只有 Code 和 Message (用于非枚举定义的异常或通用兜底)
     */
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }

    // ============================ 辅助方法 ============================

    /**
     * 前端常用的判断方法，避免手动判断 code == 200
     * Jackson 序列化时会生成 boolean isSuccess 字段
     */
    public boolean isSuccess() {
        return this.code == ErrorCode.SUCCESS.getCode();
    }

}
