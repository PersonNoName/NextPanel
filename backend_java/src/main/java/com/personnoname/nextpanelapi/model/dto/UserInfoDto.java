package com.personnoname.nextpanelapi.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserInfoDto {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime createdAt;
}
