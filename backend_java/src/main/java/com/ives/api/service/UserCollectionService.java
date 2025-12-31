package com.ives.api.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ives.api.model.entity.UserCollection;

import java.util.List;
import java.util.Map;

public interface UserCollectionService extends IService<UserCollection> {
    /**
     * 获取用户收藏列表
     * @param userId 用户ID
     * @return 收藏列表
     */
    List<Map<String, Object>> getUserCollections(Integer userId);

    /**
     * 新增收藏
     * @param userId 用户ID
     * @param cid 分类ID
     * @return 是否成功
     */
    boolean addCollection(Integer userId, Integer cid);

    /**
     * 取消收藏
     * @param userId 用户ID
     * @param cid 分类ID
     * @return 是否成功
     */
    boolean removeCollection(Integer userId, Integer cid);

}
