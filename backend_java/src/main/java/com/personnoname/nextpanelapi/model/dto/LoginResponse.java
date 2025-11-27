package com.personnoname.nextpanelapi.model.dto;

import lombok.Data;

// 登录响应DTO
@Data
public class LoginResponse {

    private String token;

    private String username;

    private String email;

    private Integer userId;

    public LoginResponse(String token, String username, String email, Integer userId) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.userId = userId;
    }
}