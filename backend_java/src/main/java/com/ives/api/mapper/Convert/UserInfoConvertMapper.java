package com.ives.api.mapper.Convert;

import com.ives.api.model.dto.UserInfoDto;
import com.ives.api.model.entity.UserInfo;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserInfoConvertMapper {
    UserInfoDto toDto(UserInfo userInfo);

    // Integer到Long的转换
    default Long map(Integer value) {
        return value == null ? null : value.longValue();
    }
}
