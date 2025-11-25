const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    comment: '用户唯一标识（自增主键）'
  },
    // 用户名（登录名）
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名（登录名）'
  },
    // 用户邮箱
  email: {
    type: DataTypes.STRING(100),
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '用户邮箱（用于登录/找回密码）'
  },
  // 密码（存储加密后的值）
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码（建议存储加密后的值，如bcrypt哈希）'
  },
  // 创建时间
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '账号创建时间'
  },
  // 更新时间
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    comment: '信息更新时间'
  },
  // 软删除标识
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
    comment: '删除时间（软删除）'
  },
},{    // 模型配置
    tableName: 'user_info',  // 对应的数据表名
    timestamps: true,        // 自动维护createdAt和updatedAt
    paranoid: true,          // 启用软删除，会使用deletedAt字段
    charset: 'utf8mb4',      // 字符集
    collate: 'utf8mb4_general_ci',  // 排序规则
    comment: '用户核心信息表',
    underscored: true,
    hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
})
// Instance method to check password
User.prototype.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;