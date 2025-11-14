const express = require('express');
const router = express.Router();
const etfNetAssetController = require('../controllers/etfNetAssetController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/etf/etf-return-rate:
 *   post:
 *     summary: 根据股票代码列表计算ETF收益率
 *     tags: [ETF]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - thsCodeList
 *               - start_date
 *               - end_date
 *             properties:
 *               thsCodeList:
 *                 type: array
 *                 description: ETF代码列表
 *                 items:
 *                   type: string
 *                   example: "159001.SZ"
 *                 example: ["159001.SZ", "510050.SH"]
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: 计算开始日期
 *                 example: "2024-07-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: 计算结束日期
 *                 example: "2024-07-04"
 *     responses:
 *       200:
 *         description: ETF收益率计算成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "收益率计算成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 2
 *                     success_count:
 *                       type: integer
 *                       example: 2
 *                     fail_count:
 *                       type: integer
 *                       example: 0
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ths_code:
 *                             type: string
 *                             example: "159001.SZ"
 *                           chinese_name:
 *                             type: string
 *                             example: "华夏上证50ETF"
 *                           sector:
 *                             type: string
 *                             example: "股票型"
 *                           start_date:
 *                             type: string
 *                             format: date
 *                             example: "2024-07-01"
 *                           end_date:
 *                             type: string
 *                             format: date
 *                             example: "2024-07-04"
 *                           start_adjusted_nav:
 *                             type: number
 *                             format: float
 *                             example: 1.05
 *                           end_adjusted_nav:
 *                             type: number
 *                             format: float
 *                             example: 1.08
 *                           return_rate:
 *                             type: number
 *                             format: float
 *                             example: 0.02857
 *                           return_rate_percent:
 *                             type: string
 *                             example: "2.86%"
 *       400:
 *         description: 请求参数无效
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 未找到相关数据
 *       500:
 *         description: 服务器错误
 */
router.post('/etf-return-rate', authenticateToken, etfNetAssetController.getEtfReturnRateByCodes);

/**
 * @swagger
 * /api/etf/sector-return-rate:
 *   post:
 *     summary: 按类别计算ETF平均收益率
 *     tags: [ETF]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_date
 *               - end_date
 *             properties:
 *               sectorList:
 *                 type: array
 *                 description: 类别名称列表（可选，不传则查询所有类别）
 *                 items:
 *                   type: string
 *                 example: ["股票型", "债券型"]
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: 计算开始日期
 *                 example: "2024-07-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: 计算结束日期
 *                 example: "2024-07-04"
 *               includeDetails:
 *                 type: boolean
 *                 description: 是否包含详细数据
 *                 example: false
 *     responses:
 *       200:
 *         description: 类别收益率计算成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "类别收益率计算成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_sectors:
 *                       type: integer
 *                       example: 5
 *                     total_etfs:
 *                       type: integer
 *                       example: 100
 *                     valid_etfs:
 *                       type: integer
 *                       example: 95
 *                     sector_results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sector:
 *                             type: string
 *                             example: "股票型"
 *                           category_name:
 *                             type: string
 *                             example: "股票型基金"
 *                           count:
 *                             type: integer
 *                             example: 50
 *                           valid_count:
 *                             type: integer
 *                             example: 48
 *                           avg_return_rate:
 *                             type: number
 *                             format: float
 *                             example: 0.035
 *                           avg_return_rate_percent:
 *                             type: string
 *                             example: "3.50%"
 *                     details:
 *                       type: array
 *                       description: 仅当includeDetails为true时返回
 *                       items:
 *                         type: object
 *       400:
 *         description: 请求参数无效
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器错误
 */
router.post('/sector-return-rate', authenticateToken, etfNetAssetController.getReturnRateBySectors);

/**
 * @swagger
 * /api/etf/available-sectors:
 *   get:
 *     summary: 获取所有可用类别列表
 *     tags: [ETF]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取类别列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取类别列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *                     sectors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sector:
 *                             type: string
 *                             example: "股票型"
 *                           description:
 *                             type: string
 *                             example: "股票型基金"
 *                           sort_order:
 *                             type: integer
 *                             example: 1
 *                           etf_count:
 *                             type: integer
 *                             example: 150
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器错误
 */
router.get('/available-sectors', authenticateToken, etfNetAssetController.getAvailableSectors);
router.get('/sector-return-history', authenticateToken, etfNetAssetController.getSectorReturnRateHistory);
router.get('/sectors/batch',authenticateToken, etfNetAssetController.getMultipleSectorsReturnRateHistory )
module.exports = router;