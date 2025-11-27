package com.personnoname.nextpanelapi.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.personnoname.nextpanelapi.mapper.UserInfoMapper;
import com.personnoname.nextpanelapi.model.entity.UserInfo;
import com.personnoname.nextpanelapi.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserInfoMapper, UserInfo> implements UserService {
    @Override
    public UserInfo getByUsername(String username) {
        return baseMapper.selectByUsername(username);
    }

    @Override
    public UserInfo getByEmail(String email) {
        return baseMapper.selectByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return baseMapper.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return baseMapper.existsByEmail(email);
    }
}
