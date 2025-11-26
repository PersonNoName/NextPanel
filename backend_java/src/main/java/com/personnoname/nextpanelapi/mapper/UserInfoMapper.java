package com.personnoname.nextpanelapi.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.personnoname.nextpanelapi.model.entity.UserInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserInfoMapper extends BaseMapper<UserInfo> {
    UserInfo selectByUsername(String username);
    UserInfo selectByEmail(@Param("email") String email);
    Boolean existsByUsername(@Param("username") String username);

    Boolean existsByEmail(@Param("email") String email);
}
