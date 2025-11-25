const { col } = require('sequelize');
const UserCollection = require('../models/etfCollect');
const User = require('../models/user');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * 获取用户收藏列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const getUserCollections = async (req, res) => {
  try {
    // Use authenticated user id from req.user (set by authenticateToken middleware)
    const uid = req.user && req.user.uid ? req.user.uid : (req.user && req.user.id ? req.user.id : null);

    if (!uid) {
      return errorResponse(res, 400, '未识别的用户，请先登录');
    }

    const collections = await UserCollection.findAll({
      where: { user_id: uid },
      include: [
        {
          association: 'category',
          attributes: [
            'cid',
            'name',
            'description',
            'item_count',
            'sort_order',
          ]
        },
      ],
      order: [['collect_time', 'DESC']]
    });

    const formatterData = collections.map(collection => ({
      collect_id: collection.collect_id,
      user_id: collection.user_id,
      cid: collection.cid,
      collect_time: collection.collect_time,
      sector: collection.category ? collection.category.name : null,
      description: collection.category ? collection.category.description : null,
      item_count: collection.category ? collection.category.item_count : null,
      sort_order: collection.category ? collection.category.sort_order : null,
    }));

    return successResponse(res, 200, '获取用户收藏列表成功', { collections: formatterData });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/**
 * 新增收藏
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const addCollection = async (req, res) => {
  try {
    const { cid } = req.body;
    const uid = req.user && req.user.uid ? req.user.uid : (req.user && req.user.id ? req.user.id : null);

    if (!uid) {
      return errorResponse(res, 401, '未识别的用户，请先登录');
    }

    if (!cid) {
      return errorResponse(res, 400, 'cid为必填参数');
    }

    const existingCollection = await UserCollection.findOne({
      where: { user_id: uid, cid }
    });

    if (existingCollection) {
      return errorResponse(res, 400, '该用户已收藏该分类');
    }

    const newCollection = await UserCollection.create({
      user_id: uid,
      cid,
      collect_time: new Date()
    });
    return successResponse(res, 201, '收藏成功');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/**
 * 单个取消收藏
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const removeCollection = async (req, res) => {
  try {
    const { cid } = req.params;
    const uid = req.user && req.user.uid ? req.user.uid : (req.user && req.user.id ? req.user.id : null);

    // 参数校验
    if (!uid) {
      return errorResponse(res, 401, '未识别的用户，请先登录');
    }

    if (!cid) {
      return errorResponse(res, 400, 'cid为必填参数');
    }

    // 删除收藏记录
    const result = await UserCollection.destroy({
      where: { user_id: uid, cid }
    });

    if (result === 0) {
      return errorResponse(res, 400, '取消收藏失败');
    }

    return successResponse(res, 200, '取消收藏成功');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

module.exports = {
  getUserCollections,
  addCollection,
  removeCollection
};