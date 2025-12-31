package com.ives.api.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ives.api.common.exception.BusinessException;
import com.ives.api.mapper.UserCollectionMapper;
import com.ives.api.model.entity.UserCollection;
import com.ives.api.service.UserCollectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserCollectionServiceImpl extends ServiceImpl<UserCollectionMapper, UserCollection> implements UserCollectionService {

    private final UserCollectionMapper userCollectionMapper;

    @Override
    public List<Map<String, Object>> getUserCollections(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("未识别的用户，请先登录");
        }
        return userCollectionMapper.getUserCollections(userId);
    }

    @Override
    @Transactional
    public boolean addCollection(Integer userId, Integer cid) {
        // 参数校验
        if (userId == null) {
            throw new BusinessException(400, "未识别的用户，请先登录");
        }
        if (cid == null){
            throw new BusinessException(400, "cid为必填参数");
        }

        // 检查是否已收藏
        UserCollection existingCollection = userCollectionMapper.findCollectionByUserAndCategory(userId, cid);
        if (existingCollection != null) {
            throw new BusinessException(400, "该用户已收藏该分类");
        }

        // 创建新的收藏记录
        UserCollection newCollection = new UserCollection();
        newCollection.setUserId(userId);
        newCollection.setCid(cid);
        newCollection.setCollectTime(LocalDateTime.now());

        int result = userCollectionMapper.addCollection(newCollection);
        return result > 0;

    }
    @Override
    @Transactional
    public boolean removeCollection(Integer userId, Integer cid) {
        // 参数校验
        if (userId == null) {
            throw new BusinessException(400, "未识别的用户，请先登录");
        }
        if (cid == null) {
            throw new BusinessException(400, "cid为必填参数");
        }

        int result = userCollectionMapper.removeCollection(userId, cid);
        if (result == 0) {
            throw new BusinessException(400, "取消收藏失败");
        }

        return true;
    }
}
