package com.personnoname.nextpanelapi.common.exception;

import com.personnoname.nextpanelapi.common.api.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.HashMap;
import java.util.Map;

@Slf4j // 需要引入 Lombok，用于打印日志
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 1. 处理自定义业务异常
     * 场景：业务代码中手动 throw new BusinessException(400, "库存不足");
     */
    @ExceptionHandler(BusinessException.class)
    public ApiResponse<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getStatusCode(), e.getMessage());
        return ApiResponse.error(e.getStatusCode(), e.getMessage());
    }

    /**
     * 2. 处理参数校验异常 (Spring Validation)
     * 场景：DTO中的 @NotNull, @Email 校验失败
     * 逻辑：将校验失败的字段和原因放入 ApiResponse 的 errors 字段中
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
// 1. 把返回值从 ApiResponse<Void> 改为 ApiResponse<Map<String, String>>
    public ApiResponse<Map<String, String>> handleValidationException(MethodArgumentNotValidException e) {
        BindingResult bindingResult = e.getBindingResult();
        Map<String, String> errorMap = new HashMap<>();

        for (FieldError fieldError : bindingResult.getFieldErrors()) {
            errorMap.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        log.warn("参数校验失败: {}", errorMap);
        // 此时 error 方法的 T 推断为 Map<String, String>，返回类型完全匹配
        return ApiResponse.error(HttpStatus.BAD_REQUEST.value(), "参数校验失败", errorMap);
    }

    /**
     * 3. 处理 404 接口不存在异常
     * 注意：需要在 application.yml 配置 spring.mvc.throw-exception-if-no-handler-found=true
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Void> handleNoHandlerFoundException(NoHandlerFoundException e) {
        return ApiResponse.error(HttpStatus.NOT_FOUND.value(), "接口不存在: " + e.getRequestURL());
    }

    /**
     * 4. 处理所有未知的系统异常 (兜底)
     * 场景：空指针、数据库连接失败、类型转换错误等
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleException(Exception e) {
        log.error("系统内部异常", e); // 打印完整堆栈信息，便于排查
        return ApiResponse.error(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "服务器内部错误，请联系管理员"
        );
    }
}