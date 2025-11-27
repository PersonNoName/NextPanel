package com.personnoname.nextpanelapi.service;

import com.personnoname.nextpanelapi.common.util.JwtUtil;
import com.personnoname.nextpanelapi.model.dto.LoginRequest;
import com.personnoname.nextpanelapi.model.dto.LoginResponse;
import com.personnoname.nextpanelapi.model.dto.RegisterRequest;
import com.personnoname.nextpanelapi.model.entity.UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * 用户注册
     */

    @Transactional(rollbackFor = Exception.class)
    public void register(RegisterRequest request) {
        // 检查用户名是否已存在
        if (userService.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        // 检查邮箱是否已存在
        if (userService.existsByEmail(request.getEmail())){
            throw new RuntimeException("邮箱已存在");
        }
        //创建新用户
        UserInfo userInfo = new UserInfo();
        userInfo.setUsername(request.getUsername());
        userInfo.setEmail(request.getEmail());
        userInfo.setPassword(passwordEncoder.encode(request.getPassword()));
        userService.save(userInfo);
    }

    /**
     * 用户登录
     */
    public LoginResponse login(LoginRequest request) {

    }

}
