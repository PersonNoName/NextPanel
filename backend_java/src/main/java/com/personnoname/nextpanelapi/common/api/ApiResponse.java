package com.personnoname.nextpanelapi.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)

public class ApiResponse<T> {
    private String status;
    private int statusCode;
    private String message;
    private T data;
    private Object errors;

    /**
     * 成功响应
     * @param statusCode HTTP状态码
     * @param message 成功消息
     * @param data 响应数据
     * @return ApiResponse
     */
    public static <T> ApiResponse<T> success(int statusCode, String message, T data) {
        return new ApiResponse<>("success", statusCode, message, data, null);
    }

    /**
     * 成功响应（无数据）
     * @param statusCode HTTP状态码
     * @param message 成功消息
     * @return ApiResponse
     */
    public static ApiResponse<Void> success(int statusCode, String message) {
        return new ApiResponse<>("success", statusCode, message, null, null);
    }

    /**
     * 错误响应
     * @param statusCode HTTP状态码
     * @param message 错误消息
     * @param errors 详细错误信息
     * @return ApiResponse
     */
    public static ApiResponse<Void> error(int statusCode, String message, Object errors) {
        return new ApiResponse<>("error", statusCode, message, null, errors);
    }

    /**
     * 错误响应（无详细错误信息）
     * @param statusCode HTTP状态码
     * @param message 错误消息
     * @return ApiResponse
     */
    public static ApiResponse<Void> error(int statusCode, String message) {
        return new ApiResponse<>("error", statusCode, message, null, null);
    }
}
