package com.ives.api.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ives.api.model.dto.UserInfoDto;
import com.ives.api.model.entity.UserInfo;

public interface UserService extends IService<UserInfo> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    UserInfoDto getUserById(Integer id);

}
