package com.personnoname.nextpanelapi.controller;


import com.personnoname.nextpanelapi.common.api.ApiResponse;
import com.personnoname.nextpanelapi.model.dto.LoginRequest;
import com.personnoname.nextpanelapi.model.dto.LoginResponse;
import com.personnoname.nextpanelapi.model.dto.RegisterRequest;
import com.personnoname.nextpanelapi.model.entity.UserInfo;
import com.personnoname.nextpanelapi.service.AuthService;
import com.personnoname.nextpanelapi.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ApiResponse<String> register(@Valid@RequestBody RegisterRequest request) {
        authService.register(request);
        return ApiResponse.success("注册成功", null);
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ApiResponse.success("登录成功", response);
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public ApiResponse<UserInfo> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        // 从Security上下文中获取当前用户ID
        Integer userId = (Integer) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        UserInfo userInfo = userService.getById(userId);
        // 清空密码字段，避免返回给前端
        userInfo.setPassword(null);
        return ApiResponse.success(userInfo);
    }
    @GetMapping("/logout")
    public ApiResponse<String> logout() {
        return ApiResponse.success("退出成功", null);
    }


}
