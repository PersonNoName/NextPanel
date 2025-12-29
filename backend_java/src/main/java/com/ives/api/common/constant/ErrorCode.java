package com.ives.api.common.constant;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // 通用错误码
    SUCCESS(200, "成功"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源未找到"),
    INTERNAL_ERROR(500, "系统内部错误"),

    // 业务错误码
    USER_NOT_FOUND(1001, "用户不存在"),
    USER_EXISTS(1002, "用户已存在"),
    INVALID_CREDENTIALS(1003, "用户名或密码错误"),
    TOKEN_EXPIRED(1004, "Token已过期"),
    INVALID_TOKEN(1005, "Token无效"),

    // 系统错误码
    DATABASE_ERROR(2001, "数据库操作失败"),
    REDIS_ERROR(2002, "缓存服务异常"),
    FILE_UPLOAD_ERROR(2003, "文件上传失败");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}

