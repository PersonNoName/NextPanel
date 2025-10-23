const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // 引入数据库连接实例

const Category = sequelize.define('Category', {
    cid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      comment: '类别唯一标识（自增主键）'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '类别名称（如“科技”“体育”）',
      validate: {
        notEmpty: true // 确保名称不为空字符串
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '类别描述（可选，说明该类别的内容）'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序权重（数值越大越靠前，用于前端展示排序）'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态：1-启用，0-禁用（逻辑删除）'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '类别创建时间'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
      comment: '类别更新时间'
    },
    item_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '该类别包含的记录数量'
    }
  }, {
    tableName: 'category',
    timestamps: false, // 禁用自动生成的createdAt/updatedAt（使用自定义的created_at/updated_at）
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    comment: '类别表',
    indexes: [
      {
        name: 'uk_name',
        unique: true,
        fields: ['name'],
        comment: '类别名称唯一，避免重复'
      },
      {
        name: 'idx_status',
        fields: ['status'],
        comment: '筛选启用/禁用类别的索引'
      }
    ]
  });

  module.exports = Category;