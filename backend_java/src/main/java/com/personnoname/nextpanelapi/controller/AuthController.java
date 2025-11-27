package com.personnoname.nextpanelapi.controller;


import com.personnoname.nextpanelapi.common.api.ApiResponse;
import com.personnoname.nextpanelapi.common.constant.ErrorCode;
import com.personnoname.nextpanelapi.model.dto.LoginRequest;
import com.personnoname.nextpanelapi.model.dto.LoginResponse;
import com.personnoname.nextpanelapi.model.dto.RegisterRequest;
import com.personnoname.nextpanelapi.model.dto.UserInfoDto;
import com.personnoname.nextpanelapi.model.entity.UserInfo;
import com.personnoname.nextpanelapi.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ApiResponse<Void> register(@Valid@RequestBody RegisterRequest request) {
        authService.register(request);
        return ApiResponse.success(ErrorCode.SUCCESS.getCode(), "注册成功");
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ApiResponse.success(ErrorCode.SUCCESS.getCode(), "登录成功", response);
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public ApiResponse<UserInfoDto> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        UserInfoDto userInfoDto = authService.getUserByToken(token);
        return ApiResponse.success(ErrorCode.SUCCESS.getCode(), "获取当前用户信息成功", userInfoDto);
    }


}
