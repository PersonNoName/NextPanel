const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Calendar = sequelize.define('Calendar', {
  // 日期，格式如 'YYYYMMDD'
  Day: {
    type: DataTypes.STRING(8),
    allowNull: true,
    comment: '日期，格式为YYYYMMDD',
    primaryKey: true
  },
  // 是否为交易日 (1: 是, 0: 否)
  IsTradingDay: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: '是否为交易日，1表示是，0表示否'
  },
  // 是否为工作日 (1: 是, 0: 否)
  IsWorkingDay: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: '是否为工作日，1表示是，0表示否'
  },
  // 备注信息
  Comments: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '备注信息，如节假日名称等'
  },
  // 是否获取到节假日信息
  FetchHoliday: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: '是否获取到节假日信息，1表示是，0表示否'
  },
  // 更新时间
  UpdateTime: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '记录更新时间'
  }
}, {
  tableName: 'calendar', // 指定数据库中的表名
  timestamps: false, // 不需要自动添加 createdAt 和 updatedAt 字段
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
  id: false
});

module.exports = Calendar;
