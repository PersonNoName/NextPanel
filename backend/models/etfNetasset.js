const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // 引入数据库连接实例

// 定义 ETF 净值模型
const EtfNetasset = sequelize.define('EtfNetasset', {
  // 对应 ths_code 字段（varchar(32)，非空，主键之一）
  ths_code: {
    type: DataTypes.STRING(32), // 对应 MySQL 的 varchar(32)
    allowNull: false, // NOT NULL
    primaryKey: true, // 作为复合主键之一
    comment: 'ETF 代码'
  },
  // 对应 time 字段（date，非空，主键之一）
  time: {
    type: DataTypes.DATEONLY, // 对应 MySQL 的 date 类型
    allowNull: false, // NOT NULL
    primaryKey: true, // 作为复合主键之一
    comment: '日期'
  },
  // 对应 net_asset_value 字段（float，可空）
  net_asset_value: {
    type: DataTypes.FLOAT, // 对应 MySQL 的 float
    allowNull: true, // NULL DEFAULT NULL
    comment: '单位净值'
  },
  // 对应 adjusted_nav 字段（float，可空）
  adjusted_nav: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: '复权单位净值'
  },
  // 对应 accumulated_nav 字段（float，可空）
  accumulated_nav: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: '累计单位净值'
  },
  // 对应 premium 字段（float，可空）
  premium: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: '贴水'
  },
  // 对应 premium_ratio 字段（float，可空）
  premium_ratio: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: '贴水率'
  }
}, {
  // 模型配置（对应原表属性）
  tableName: 'etf_netasset', // 显式指定表名（避免 Sequelize 自动复数化）
  timestamps: false, // 禁用默认添加的 createdAt/updatedAt 字段（原表无）
  charset: 'utf8mb4', // 对应原表的 CHARACTER SET
  collate: 'utf8mb4_general_ci', // 对应原表的 COLLATE
  engine: 'InnoDB', // 对应原表的 ENGINE
  rowFormat: 'DYNAMIC' // 对应原表的 ROW_FORMAT
});

module.exports = EtfNetasset;