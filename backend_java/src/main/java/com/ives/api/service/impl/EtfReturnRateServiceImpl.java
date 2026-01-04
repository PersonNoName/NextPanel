package com.ives.api.service.impl;

import com.ives.api.common.exception.BusinessException;
import com.ives.api.mapper.CalendarMapper;
import com.ives.api.mapper.CategoryMapper;
import com.ives.api.mapper.EtfInfoMapper;
import com.ives.api.mapper.EtfNetassetMapper;
import com.ives.api.model.dto.*;
import com.ives.api.model.entity.Calendar;
import com.ives.api.model.entity.Category;
import com.ives.api.model.entity.EtfInfo;
import com.ives.api.model.entity.EtfNetasset;
import com.ives.api.service.EtfReturnRateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EtfReturnRateServiceImpl implements EtfReturnRateService {
    private final EtfNetassetMapper etfNetassetMapper;
    private final EtfInfoMapper etfInfoMapper;
    private final CategoryMapper categoryMapper;
    private final CalendarMapper calendarMapper;

    private static final float EPSILON = 1e-6f;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter COMPACT_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Override
    public EtfReturnRateResponse getEtfReturnRateByCodes(EtfReturnRateRequest request) {
        List<String> validCodes = request.getThsCodeList().stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (validCodes.isEmpty()) {
            throw new BusinessException(400, "thsCodeList数组中无有效代码");
        }

        List<ReturnRateResult> results = new ArrayList<>();

        for (String code : validCodes) {
            try {
                EtfNetasset startData = etfNetassetMapper.findByCodeAndDate(
                        code.trim(), request.getStart_date());
                EtfNetasset endData = etfNetassetMapper.findByCodeAndDate(
                        code.trim(), request.getEnd_date());
                EtfInfo etfInfo = etfInfoMapper.findByCode(code.trim());

                if (startData == null) {
                    results.add(ReturnRateResult.error(code,
                            "未找到" + request.getStart_date() + "的净值数据"));
                    continue;
                }

                if (endData == null) {
                    results.add(ReturnRateResult.error(code,
                            "未找到" + request.getEnd_date() + "的净值数据"));
                    continue;
                }

                BigDecimal startNav = startData.getAdjustedNav();
                BigDecimal endNav = endData.getAdjustedNav();

                if (startNav.compareTo(BigDecimal.ZERO) <= 0) {
                    results.add(ReturnRateResult.error(code, "起始日净值不能为零或负数"));
                    continue;
                }

                BigDecimal returnRate = endNav.subtract(startNav)
                        .divide(startNav, 6, RoundingMode.HALF_UP);
                ReturnRateResult result = new ReturnRateResult();

                result.setThsCode(code);
                result.setChineseName(etfInfo != null ? etfInfo.getChineseName() : "未知名称");
                result.setSector(etfInfo != null ? etfInfo.getSector() : "未知类别");
                result.setStartDate(startData.getTime());
                result.setEndDate(endData.getTime());
                result.setStartAdjustedNav(startNav);
                result.setEndAdjustedNav(endNav);
                result.setReturnRate(returnRate);
                result.setReturnRatePercent(returnRate.multiply(new BigDecimal("100"))
                        .setScale(2, RoundingMode.HALF_UP) + "%");
                results.add(result);
            } catch (Exception e) {
                log.error("计算ETF {} 收益率时出错", code, e);
                results.add(ReturnRateResult.error(code, e.getMessage()));
            }
        }
        EtfReturnRateResponse response = new EtfReturnRateResponse();
        response.setTotal(validCodes.size());
        response.setSuccessCount((int) results.stream().filter(r -> r.getError() == null).count());
        response.setFailCount((int) results.stream().filter(r -> r.getError() != null).count());
        response.setResults(results);

        return response;
    }

    @Override
    public SectorReturnRateResponse getReturnRateBySectors(SectorReturnRateRequest request) {
        List<EtfInfo> etfList;

        if (CollectionUtils.isEmpty(request.getSectorList())) {
            etfList = etfInfoMapper.findAll();
        } else {
            etfList = etfInfoMapper.findBySectors(request.getSectorList());
        }

        if (etfList.isEmpty()) {
            return SectorReturnRateResponse.empty();
        }
        List<String> thsCodes = etfList.stream()
                .map(EtfInfo::getThsCode)
                .collect(Collectors.toList());

        List<EtfNetasset> startDateData = etfNetassetMapper.findByCodesAndDate(
                thsCodes, request.getStart_date());
        List<EtfNetasset> endDateData = etfNetassetMapper.findByCodesAndDate(
                thsCodes, request.getEnd_date());

        Map<String, EtfNetasset> startDataMap = startDateData.stream()
                .collect(Collectors.toMap(EtfNetasset::getThsCode, e -> e));
        Map<String, EtfNetasset> endDataMap = endDateData.stream()
                .collect(Collectors.toMap(EtfNetasset::getThsCode, e -> e));
        Map<String, SectorAccumulator> sectorAccMap = new HashMap<>();
        List<ReturnRateResult> details = new ArrayList<>();

        for (EtfInfo etf : etfList) {
            String thsCode = etf.getThsCode();
            String sector = etf.getSector();

            EtfNetasset startData = startDataMap.get(thsCode);
            EtfNetasset endData = endDataMap.get(thsCode);

            if (startData == null || endData == null) {
                continue;
            }

            BigDecimal startNav = startData.getAdjustedNav();
            BigDecimal endNav = endData.getAdjustedNav();

            if (startNav.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal returnRate = endNav.subtract(startNav)
                    .divide(startNav, 6, RoundingMode.HALF_UP);

            ReturnRateResult detail = new ReturnRateResult();
            detail.setThsCode(thsCode);
            detail.setChineseName(etf.getChineseName());
            detail.setSector(sector);
            detail.setStartDate(startData.getTime());
            detail.setEndDate(endData.getTime());
            detail.setStartAdjustedNav(startNav);
            detail.setEndAdjustedNav(endNav);
            detail.setReturnRate(returnRate);
            detail.setReturnRatePercent(returnRate.multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP) + "%");
            details.add(detail);

            sectorAccMap.computeIfAbsent(sector, k -> new SectorAccumulator())
                    .add(returnRate);
        }
        List<String> sectorNames = new ArrayList<>(sectorAccMap.keySet());
        List<Category> categories = categoryMapper.findByNames(sectorNames);
        Map<String, Category> categoryMap = categories.stream()
                .collect(Collectors.toMap(Category::getName, c -> c));
        List<SectorReturnResult> sectorResults = sectorAccMap.entrySet().stream()
                .map(entry -> {
                    String sector = entry.getKey();
                    SectorAccumulator acc = entry.getValue();
                    Category category = categoryMap.get(sector);

                    BigDecimal avgRate = acc.getAverage();

                    SectorReturnResult result = new SectorReturnResult();
                    result.setSector(sector);
                    result.setCategory_name(category != null ? category.getDescription() : sector);
                    result.setCount(acc.getCount());
                    result.setValid_count(acc.getValidCount());
                    result.setAvg_return_rate(avgRate);
                    result.setAvg_return_rate_percent(avgRate.multiply(new BigDecimal("100"))
                            .setScale(2, RoundingMode.HALF_UP) + "%");
                    return result;
                })
                .sorted((a, b) -> b.getAvg_return_rate().compareTo(a.getAvg_return_rate()))
                .collect(Collectors.toList());
        SectorReturnRateResponse response = new SectorReturnRateResponse();
        response.setTotal_sectors(sectorResults.size());
        response.setTotal_etfs(etfList.size());
        response.setValid_etfs((int) details.stream().filter(d -> d.getError() == null).count());
        response.setSector_results(sectorResults);

        if (request.getIncludeDetails()) {
            response.setDetails(details);
        }

        return response;
    }

    @Override
    public List<SectorInfo> getAvailableSectors() {
        List<Category> categories = categoryMapper.findAllActive();
        return categories.stream()
                .map(cat -> {
                    SectorInfo info = new SectorInfo();
                    info.setCid(cat.getCid());
                    info.setSector(cat.getName());
                    info.setDescription(cat.getDescription());
                    info.setSortOrder(cat.getSortOrder());
                    info.setEtfCount(cat.getItemCount() != null ? cat.getItemCount() : 0);
                    return info;
                })
                .collect(Collectors.toList());
    }

    @Override
    public SectorReturnRateHistoryResponse getSectorReturnRateHistory(String sector, String date, Integer n, Boolean includeDetails) {
        if (n == null || n <= 0) {
            throw new IllegalArgumentException("n必须为正整数");
        }

        List<Calendar> tradingDays = getTradingDays(date, n);

        List<EtfInfo> etfList = etfInfoMapper.findBySector(sector);

        if (etfList.isEmpty()) {
            throw new BusinessException(400, "未找到类别为\"" + sector + "\"的ETF数据");
        }
        List<String> thsCodes = etfList.stream()
                .map(EtfInfo::getThsCode)
                .collect(Collectors.toList());
        List<String> allDates = tradingDays.stream()
                .map(day -> formatDate(day.getDay()))
                .collect(Collectors.toList());
        List<EtfNetasset> netAssets = etfNetassetMapper.findByCodesAndDates(thsCodes, allDates);

        Map<String, BigDecimal> navIndex = netAssets.stream()
                .collect(Collectors.toMap(
                        nav -> nav.getThsCode() + "_" + nav.getTime(),
                        EtfNetasset::getAdjustedNav
                ));
        List<DailyReturnRate> history = calculateSectorReturnHistory(
                etfList, tradingDays, navIndex, includeDetails);

        Category category = categoryMapper.findByName(sector);

        SectorReturnRateHistoryResponse response = new SectorReturnRateHistoryResponse();
        response.setSector(sector);
        response.setSectorDescription(category != null ? category.getDescription() : sector);
        response.setQueryDate(date);
        response.setActualEndDate(formatDate(tradingDays.get(tradingDays.size() - 1).getDay()));
        response.setRequestedCount(n);
        response.setActualCount(history.size());
        response.setTotalEtfs(etfList.size());
        response.setReturnRateHistory(history);

        return response;
    }

    @Override
    public MultipleSectorsReturnRateHistoryResponse getMultipleSectorsReturnRateHistory(String sectors, String date, Integer n, Boolean includeDetails, Boolean includeTiming) {
        long overallStart = System.currentTimeMillis();
        Map<String, Long> timing = new HashMap<>();

        if (n == null || n <= 0) {
            throw new BusinessException(400, "n必须为正整数");
        }

        List<String> sectorList = Arrays.stream(sectors.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        if (sectorList.isEmpty()) {
            throw new BusinessException(400, "至少提供一个有效的类别");
        }
        BatchQueryResult result = batchQuerySectorsReturnRate(
                sectorList, date, n, includeDetails, timing);

        long totalTime = System.currentTimeMillis() - overallStart;

        MultipleSectorsReturnRateHistoryResponse response = new MultipleSectorsReturnRateHistoryResponse();
        response.setSectorsCount(result.getSectorsCount());
        response.setQueryDate(result.getQueryDate());
        response.setTradingDaysCount(result.getTradingDaysCount());
        response.setResults(result.getResults());

        PerformanceInfo performance = new PerformanceInfo();
        performance.setResponseTimeMs(totalTime);
        performance.setSectorsQueried(sectorList.size());
        performance.setTradingDays(n);

        if (Boolean.TRUE.equals(includeTiming)) {
            performance.setDetailedTiming(timing);
        }

        response.setPerformance(performance);

        return response;
    }

    private List<Calendar> getTradingDays(String date, int n) {
        String targetDate = date.replace("-", "");

        Calendar endDay = calendarMapper.findByDay(targetDate);
        if (endDay == null) {
            throw new IllegalArgumentException("日期" + date + "不在日历表中");
        }

        if (endDay.getIsTradingDay() == 0) {
            endDay = calendarMapper.findPreviousTradingDay(targetDate);
            if (endDay == null) {
                throw new IllegalArgumentException("未找到有效的交易日");
            }
        }

        List<Calendar> tradingDays = calendarMapper.findPreviousNTradingDays(endDay.getDay(), n + 1);

        if (tradingDays.size() < n + 1) {
            throw new IllegalArgumentException(
                    String.format("交易日数量不足。需要%d个，找到%d个", n + 1, tradingDays.size()));
        }

        tradingDays.sort(Comparator.comparing(Calendar::getDay));
        return tradingDays;
    }
    private BatchQueryResult batchQuerySectorsReturnRate(
            List<String> sectorList, String date, int n, Boolean includeDetails,
            Map<String, Long> timing) {

        long start = System.currentTimeMillis();
        List<Calendar> tradingDays = getTradingDays(date, n);
        timing.put("calendar_query_ms", System.currentTimeMillis() - start);

        start = System.currentTimeMillis();
        List<EtfInfo> allEtfs = etfInfoMapper.findBySectors(sectorList);
        timing.put("etf_info_query_ms", System.currentTimeMillis() - start);

        if (allEtfs.isEmpty()) {
            throw new IllegalArgumentException("未找到类别为" + String.join(",", sectorList) + "的ETF数据");
        }

        Map<String, List<EtfInfo>> etfsBySector = allEtfs.stream()
                .collect(Collectors.groupingBy(EtfInfo::getSector));

        start = System.currentTimeMillis();
        List<String> allDates = tradingDays.stream()
                .map(day -> formatDate(day.getDay()))
                .collect(Collectors.toList());
        List<String> allCodes = allEtfs.stream()
                .map(EtfInfo::getThsCode)
                .collect(Collectors.toList());

        List<EtfNetasset> netAssets = etfNetassetMapper.findByCodesAndDates(allCodes, allDates);
        timing.put("netasset_query_ms", System.currentTimeMillis() - start);

        Map<String, BigDecimal> navIndex = netAssets.stream()
                .collect(Collectors.toMap(
                        nav -> nav.getThsCode() + "_" + nav.getTime(),
                        EtfNetasset::getAdjustedNav
                ));

        start = System.currentTimeMillis();
        Map<String, SectorHistoryResult> sectorResults = new HashMap<>();

        for (String sector : sectorList) {
            List<EtfInfo> sectorEtfs = etfsBySector.getOrDefault(sector, Collections.emptyList());

            if (sectorEtfs.isEmpty()) {
                SectorHistoryResult result = new SectorHistoryResult();
                result.setError("未找到类别\"" + sector + "\"的ETF数据");
                result.setTotalEtfs(0);
                result.setReturnRateHistory(Collections.emptyList());
                sectorResults.put(sector, result);
                continue;
            }

            List<DailyReturnRate> history = calculateSectorReturnHistory(
                    sectorEtfs, tradingDays, navIndex, includeDetails);

            Category category = categoryMapper.findByName(sector);

            SectorHistoryResult result = new SectorHistoryResult();
            result.setSectorDescription(category != null ? category.getDescription() : sector);
            result.setTotalEtfs(sectorEtfs.size());
            result.setQueryDate(date);
            result.setActualEndDate(formatDate(tradingDays.get(tradingDays.size() - 1).getDay()));
            result.setRequestedCount(n);
            result.setActualCount(history.size());
            result.setReturnRateHistory(history);

            sectorResults.put(sector, result);
        }

        timing.put("calculation_ms", System.currentTimeMillis() - start);

        BatchQueryResult result = new BatchQueryResult();
        result.setSectorsCount(sectorList.size());
        result.setQueryDate(date);
        result.setTradingDaysCount(tradingDays.size());
        result.setResults(sectorResults);

        return result;
    }

    private List<DailyReturnRate> calculateSectorReturnHistory(
            List<EtfInfo> etfList, List<Calendar> tradingDays,
            Map<String, BigDecimal> navIndex, Boolean includeDetails) {

        List<DailyReturnRate> results = new ArrayList<>();

        for (int i = 1; i < tradingDays.size(); i++) {
            String prevDate = formatDate(tradingDays.get(i - 1).getDay());
            String currDate = formatDate(tradingDays.get(i).getDay());

            BigDecimal totalReturnRate = BigDecimal.ZERO;
            int validCount = 0;
            List<EtfReturnDetail> etfDetails = Boolean.TRUE.equals(includeDetails)
                    ? new ArrayList<>() : null;

            for (EtfInfo etf : etfList) {
                String code = etf.getThsCode();
                BigDecimal prevNav = navIndex.get(code + "_" + prevDate);
                BigDecimal currNav = navIndex.get(code + "_" + currDate);

                if (prevNav != null && currNav != null && prevNav.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal returnRate = currNav.subtract(prevNav)
                            .divide(prevNav, 6, RoundingMode.HALF_UP);
                    totalReturnRate = totalReturnRate.add(returnRate);
                    validCount++;

                    if (etfDetails != null) {
                        EtfReturnDetail detail = new EtfReturnDetail();
                        detail.setThsCode(code);
                        detail.setChineseName(etf.getChineseName());
                        detail.setPrevNav(prevNav);
                        detail.setCurrNav(currNav);
                        detail.setReturnRate(returnRate);
                        detail.setReturnRatePercent(returnRate.multiply(new BigDecimal("100"))
                                .setScale(2, RoundingMode.HALF_UP) + "%");
                        etfDetails.add(detail);
                    }
                }
            }

            DailyReturnRate dailyRate = new DailyReturnRate();
            dailyRate.setStartDate(prevDate);
            dailyRate.setEndDate(currDate);
            dailyRate.setValidEtfCount(validCount);

            if (validCount > 0) {
                BigDecimal avgRate = totalReturnRate.divide(
                        new BigDecimal(validCount), 6, RoundingMode.HALF_UP);
                dailyRate.setAvgReturnRate(avgRate);
                dailyRate.setAvgReturnRatePercent(avgRate.multiply(new BigDecimal("100"))
                        .setScale(2, RoundingMode.HALF_UP) + "%");
            } else {
                dailyRate.setAvgReturnRatePercent("N/A");
                dailyRate.setError("该时间段内没有有效的ETF净值数据");
            }

            if (etfDetails != null) {
                dailyRate.setEtfDetails(etfDetails);
            }

            results.add(dailyRate);
        }

        Collections.reverse(results);
        return results;
    }
    private String formatDate(String dateStr) {
        if (dateStr.contains("-")) {
            return dateStr;
        }
        LocalDate date = LocalDate.parse(dateStr, COMPACT_FORMATTER);
        return date.format(DATE_FORMATTER);
    }

    private static class SectorAccumulator {
        private int count = 0;
        private int validCount = 0;
        private BigDecimal totalReturnRate = BigDecimal.ZERO;

        void add(BigDecimal returnRate) {
            count++;
            validCount++;
            totalReturnRate = totalReturnRate.add(returnRate);
        }

        int getCount() { return count; }
        int getValidCount() { return validCount; }
        BigDecimal getAverage() {
            return validCount > 0
                    ? totalReturnRate.divide(new BigDecimal(validCount), 6, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
        }
    }
}
