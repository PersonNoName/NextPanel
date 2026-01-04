package com.ives.api.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ives.api.common.constant.ErrorCode;
import com.ives.api.common.exception.BusinessException;
import com.ives.api.Convert.UserInfoConvertMapper;
import com.ives.api.mapper.UserInfoMapper;
import com.ives.api.model.dto.UserInfoDto;
import com.ives.api.model.entity.UserInfo;
import com.ives.api.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserInfoMapper, UserInfo> implements UserService {
    private final UserInfoMapper userInfoMapper;
    private final UserInfoConvertMapper userInfoConvertMapper;

    @Override
    public boolean existsByUsername(String username) {
        LambdaQueryWrapper<UserInfo> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserInfo::getUsername, username);
        return this.exists(wrapper);
    }

    @Override
    public boolean existsByEmail(String email) {
        LambdaQueryWrapper<UserInfo> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserInfo::getEmail, email);
        return this.exists(wrapper);
    }

    @Override
    public UserInfoDto getUserById(Integer id) {
        log.info("查询用户信息，用户ID：{}", id);
        if (id == null || id <= 0) {
            log.warn("用户ID不合法，ID：{}", id);
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }
        UserInfo userInfo = baseMapper.selectOne(new LambdaQueryWrapper<UserInfo>()
                .select(UserInfo::getId, UserInfo::getUsername, UserInfo::getEmail)
                .eq(UserInfo::getId, id));

        if (userInfo == null) {
            log.warn("用户不存在，ID：{}", id);
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return userInfoConvertMapper.toDto(userInfo);
    }
}
