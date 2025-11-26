package com.personnoname.nextpanelapi.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.personnoname.nextpanelapi.common.constant.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private String status;     // success / error
    private int statusCode;    // 业务状态码（HTTP 码或 ErrorCode 码）
    private String message;    // 说明信息
    private T data;            // 数据
    private Object errors;     // 详细错误（可选）

    /* ======================== 成功响应 ======================== */

    /**
     * 成功（推荐） — 使用标准成功码
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(
                "success",
                ErrorCode.SUCCESS.getCode(),
                ErrorCode.SUCCESS.getMessage(),
                data,
                null
        );
    }

    /**
     * 成功（自定义消息）
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(
                "success",
                ErrorCode.SUCCESS.getCode(),
                message,
                data,
                null
        );
    }

    /**
     * 成功（完全自定义）
     */
    public static <T> ApiResponse<T> success(int statusCode, String message, T data) {
        return new ApiResponse<>("success", statusCode, message, data, null);
    }

    /**
     * 成功（无数据）
     */
    public static ApiResponse<Void> success(int statusCode, String message) {
        return new ApiResponse<>("success", statusCode, message, null, null);
    }


    /* ======================== 错误响应 ======================== */

    /**
     * 错误（完全自定义）
     */
    public static ApiResponse<Void> error(int statusCode, String message, Object errors) {
        return new ApiResponse<>("error", statusCode, message, null, errors);
    }

    /**
     * 错误（无详细 errors）
     */
    public static ApiResponse<Void> error(int statusCode, String message) {
        return new ApiResponse<>("error", statusCode, message, null, null);
    }

    /**
     * 标准化错误（强烈推荐）
     * 用于：直接返回业务错误 或 GlobalExceptionHandler 中的 BusinessException
     */
    public static ApiResponse<Void> error(ErrorCode errorCode) {
        return new ApiResponse<>(
                "error",
                errorCode.getCode(),
                errorCode.getMessage(),
                null,
                null
        );
    }

    /**
     * 标准化错误 + 携带 errors（例如参数校验）
     */
    public static ApiResponse<Void> error(ErrorCode errorCode, Object errors) {
        return new ApiResponse<>(
                "error",
                errorCode.getCode(),
                errorCode.getMessage(),
                null,
                errors
        );
    }
}
