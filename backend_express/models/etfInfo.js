const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // 引入数据库连接实例

const EtfInfo = sequelize.define('EtfInfo', {
  ths_code: {
    type: DataTypes.STRING(32),
    allowNull: false,
    primaryKey: true,
    primaryKey: true,
    comment: 'ETF的THS代码'
  },
  chinese_name: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'ETF的中文名称'
  },
  start_day: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '开始日期'
  },
  end_day: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '结束日期'
  },
  sector: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: '所属行业/板块'
  }
}, {
  tableName: 'etf_info',
  timestamps: false, // 表中没有 createdAt 和 updatedAt 字段
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
  indexes: [
    {
      name: 'idx_etf_id',
      fields: ['ths_code']
    },
    {
      name: 'idx_etf_category',
      fields: ['sector']
    }
  ]
});
module.exports = EtfInfo;
