package com.ives.api.common.exception;

import com.ives.api.common.api.Result;
import com.ives.api.common.constant.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    /**
     * 1. 处理自定义业务异常
     * 场景：业务代码中手动 throw new BusinessException(400, "库存不足");
     */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getStatusCode(), e.getMessage());
        return Result.error(e.getStatusCode(), e.getMessage());
    }

    /**
     * 2. 处理参数校验异常 (Spring Validation)
     * 场景：DTO中的 @NotNull, @Email 校验失败
     * 逻辑：将校验失败的字段和原因放入 ApiResponse 的 errors 字段中
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Map<String, String>> handleValidationException(MethodArgumentNotValidException e){
        BindingResult bindingResult = e.getBindingResult();
        // 提取所有字段的错误信息，拼接成字符串
        String errorMsg = bindingResult.getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数校验失败: {}", errorMsg);
        return Result.error(ErrorCode.BAD_REQUEST, errorMsg);
    }

    /**
     * 3. 处理 404 接口不存在异常
     * 注意：需要在 application.yml 配置 spring.mvc.throw-exception-if-no-handler-found=true
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handleNoHandlerFoundException(NoHandlerFoundException e){
        return Result.error(ErrorCode.NOT_FOUND, "接口不存在");
    }

    /**
     * 4. 处理所有未知的系统异常 (兜底)
     * 场景：空指针、数据库连接失败、类型转换错误等
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleException(Exception e) {
        log.error("系统内部异常", e);
        return Result.error(
                ErrorCode.INTERNAL_ERROR,
                "服务器内部错误，请联系管理员"
        );
    }

}
