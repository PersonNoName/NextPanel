const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // 引入数据库连接实例

const UserCollection = sequelize.define('UserCollection', {
    collect_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: '收藏记录唯一标识'
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '关联的用户ID（外键，用户删除时自动删除其所有收藏记录）'
    },
    cid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '兴趣类别标识（关联已存在的兴趣表，兴趣类别删除时自动删除关联的收藏记录）'
    },
    collect_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '收藏时间'
    }
}, {
    tableName: 'user_collection',
    timestamps: false, // 禁用自动生成的createdAt/updatedAt（使用自定义的collect_time）
    charset: 'utf8mb4',
    collate: 'utf8mb4_0900_ai_ci',
    comment: '用户兴趣收藏表',
    indexes: [
        {
            name: 'uk_user_cid',
            unique: true,
            fields: ['user_id', 'cid'],
            comment: '同一用户不能重复收藏同一兴趣类别'
        },
        {
            name: 'idx_cid',
            fields: ['cid'],
            comment: '通过兴趣类别查询收藏用户的索引'
        }
    ],
    // 外键约束配置（Sequelize 会自动根据关联模型生成约束，此处保持与原表结构一致）
    foreignKeys: [
        {
            name: 'fk_collection_user',
            table: 'user_collection',
            field: 'user_id',
            referencedTable: 'user_info',
            referencedField: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'RESTRICT'
        },
        {
            name: 'fk_collection_category',
            table: 'user_collection',
            field: 'cid',
            referencedTable: 'category',
            referencedField: 'cid',
            onDelete: 'CASCADE',
            onUpdate: 'RESTRICT'
        }
    ]
});

// 定义模型关联（可选，根据实际业务需求添加）
// 关联用户表
UserCollection.belongsTo(require('./user'), {
    foreignKey: 'user_id',
    targetKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
    as: 'user'
});

// 关联类别表
UserCollection.belongsTo(require('./category'), {
    foreignKey: 'cid',
    targetKey: 'cid',
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
    as: 'category'
});

module.exports = UserCollection;
    