package com.ives.api.common.exception;

import com.ives.api.common.constant.ErrorCode;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final int statusCode;

    /**
     * 1. 使用 ErrorCode 构造异常 (推荐用法)
     * 用法: throw new BusinessException(ErrorCode.USER_NOT_FOUND);
     */
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.statusCode = errorCode.getCode();
    }

    /**
     * 2. 手动指定状态码和消息 (保留原有方式以备不时之需)
     * 用法: throw new BusinessException(400, "自定义错误");
     */
    public BusinessException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

}
