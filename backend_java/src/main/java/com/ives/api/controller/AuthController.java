package com.ives.api.controller;

import com.ives.api.common.api.Result;
import com.ives.api.model.dto.LoginRequest;
import com.ives.api.model.dto.LoginResponse;
import com.ives.api.model.dto.RegisterRequest;
import com.ives.api.model.dto.UserInfoDto;
import com.ives.api.service.AuthService;
import com.ives.api.service.UserService;
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
    public Result<String> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return Result.success("注册成功", null);
    }
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success(response, "登录成功");
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public Result<UserInfoDto> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        // 从Security上下文中获取当前用户ID
        Integer userId = (Integer) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        UserInfoDto userInfo = userService.getUserById(userId);

        return Result.success(userInfo);
    }
    /**
     * 登出
     */
    @GetMapping("/logout")
    public Result<String> louout(){
        return Result.success(null, "退出成功");
    }


}
