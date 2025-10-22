const express = require('express');
const router = express.Router();
const etfNetAssetController = require('../controllers/etfNetAssetContrller');

router.get('/etf-netasset/:ths_code/:date', etfNetAssetController.getEtfNetassetByDate);

module.exports = router;