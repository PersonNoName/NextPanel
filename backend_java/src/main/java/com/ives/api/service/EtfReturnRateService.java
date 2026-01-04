package com.ives.api.service;

import com.ives.api.model.dto.*;

import java.util.List;

public interface EtfReturnRateService {
    /**
     * 按股票代码列表计算收益率
     */
    EtfReturnRateResponse getEtfReturnRateByCodes(EtfReturnRateRequest request);

    /**
     * 按类别计算平均收益率
     */
    SectorReturnRateResponse getReturnRateBySectors(SectorReturnRateRequest request);

    /**
     * 获取所有可用类别
     */
    List<SectorInfo> getAvailableSectors();

    /**
     * 查询n个连续交易日的类别平均收益率
     */
    SectorReturnRateHistoryResponse getSectorReturnRateHistory(
            String sector, String date, Integer n, Boolean includeDetails);

    /**
     * 批量查询多个类别的收益率历史
     */
    MultipleSectorsReturnRateHistoryResponse getMultipleSectorsReturnRateHistory(
            String sectors, String date, Integer n, Boolean includeDetails, Boolean includeTiming);

}
