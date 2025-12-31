package com.ives.api.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ives.api.model.entity.UserCollection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserCollectionMapper extends BaseMapper<UserCollection> {
    // 获取用户收藏列表（带分类信息）
    List<Map<String, Object>> getUserCollections(Integer userId);

    // 检查是否已收藏
    UserCollection findCollectionByUserAndCategory(@Param("userId") Integer userId, @Param("cid") Integer cid);

    // 新增收藏
    int addCollection(UserCollection userCollection);

    // 删除收藏
    int removeCollection(@Param("userId") Integer userId, @Param("cid") Integer cid);
}
