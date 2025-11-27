package com.personnoname.nextpanelapi.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.personnoname.nextpanelapi.model.entity.UserInfo;

public interface UserService extends IService<UserInfo> {
    UserInfo getByUsername(String username);

    UserInfo getByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
