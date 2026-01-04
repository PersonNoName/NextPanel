package com.ives.api.Convert;

import com.ives.api.model.dto.UserInfoDto;
import com.ives.api.model.entity.UserInfo;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserInfoConvertMapper {
    UserInfoConvertMapper INSTANCE = Mappers.getMapper(UserInfoConvertMapper.class);

    UserInfoDto toDto(UserInfo userInfo);

    // Integer到Long的转换
    default Long map(Integer value) {
        return value == null ? null : value.longValue();
    }
}
