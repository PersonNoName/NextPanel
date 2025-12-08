package com.personnoname.nextpanelapi.common.api;

import lombok.Data;

@Data
public class ApiResponse<T> {
    private Integer code;
    private String status;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> result = new ApiResponse<>();
        result.setCode(200);
        result.setStatus("success");
        result.setMessage("操作成功");
        result.setData(data);
        return result;
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        ApiResponse<T> result = new ApiResponse<>();
        result.setCode(200);
        result.setStatus("success");
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> result = new ApiResponse<>();
        result.setCode(500);
        result.setStatus("error");
        result.setMessage(message);
        return result;
    }

    public static <T> ApiResponse<T> error(Integer code, String message) {
        ApiResponse<T> result = new ApiResponse<>();
        result.setCode(code);
        result.setStatus("error");
        result.setMessage(message);
        return result;
    }

    public static <T> ApiResponse<T> error(Integer code, String message, T data) {
        ApiResponse<T> result = new ApiResponse<>();
        result.setCode(code);
        result.setStatus("error");
        result.setMessage(message);
        result.setData(data);
        return result;
    }

}
