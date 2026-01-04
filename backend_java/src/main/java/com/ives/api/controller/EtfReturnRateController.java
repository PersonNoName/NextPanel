package com.ives.api.controller;

import com.ives.api.common.api.Result;
import com.ives.api.model.dto.*;
import com.ives.api.service.EtfReturnRateService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etf")
@RequiredArgsConstructor
@Validated
public class EtfReturnRateController {
    private final EtfReturnRateService etfReturnRateService;

    @PostMapping("/etf-return-rate")
    public Result<EtfReturnRateResponse> getEtfReturnRateByCodes(@Valid @RequestBody EtfReturnRateRequest request) {
        try {
            EtfReturnRateResponse response = etfReturnRateService.getEtfReturnRateByCodes(request);
            return Result.success(response, "收益率计算成功");
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            return Result.error(500, "服务器错误，无法计算类别收益率");
        }
    }
    @PostMapping("/sector-return-rate")
    public Result<SectorReturnRateResponse> getReturnRateBySectors(
            @Valid @RequestBody SectorReturnRateRequest request) {
        try {
            SectorReturnRateResponse response = etfReturnRateService.getReturnRateBySectors(request);
            return Result.success(response,"类别收益率计算成功");
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            return Result.error(500, "服务器错误，无法计算类别收益率");
        }
    }

    @GetMapping("/available-sectors")
    public Result<SectorListResponse> getAvailableSectors() {
        try {
            List<SectorInfo> sectors = etfReturnRateService.getAvailableSectors();
            SectorListResponse responseData = new SectorListResponse(sectors.size(), sectors);
            return Result.success(responseData, "获取类别列表成功");
        } catch (Exception e) {
            return Result.error(500, "服务器错误，无法获取类别列表");
        }
    }

    @GetMapping("/sector-return-history")
    public Result<SectorReturnRateHistoryResponse> getSectorReturnRateHistory(
            @RequestParam String sector,

            @RequestParam
            @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "日期格式错误，应为YYYY-MM-DD")
            String date,

            @RequestParam(defaultValue = "3")
            @Positive(message = "n必须为正整数")
            Integer n,

            @RequestParam(defaultValue = "false") Boolean includeDetails){
        try {
            SectorReturnRateHistoryResponse response = etfReturnRateService
                    .getSectorReturnRateHistory(sector, date, n, includeDetails);
            return Result.success(response,"类别收益率历史查询成功");
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            return Result.error(500, "服务器错误，无法查询类别收益率历史");
        }
    }
    @GetMapping("/sectors/batch")
    public Result<MultipleSectorsReturnRateHistoryResponse> getMultipleSectorsReturnRateHistory(
            @RequestParam String sectors,

            @RequestParam
            @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "日期格式错误，应为YYYY-MM-DD")
            String date,

            @RequestParam(defaultValue = "15")
            @Positive(message = "n必须为正整数")
            Integer n,

            @RequestParam(defaultValue = "false") Boolean includeDetails,

            @RequestParam(defaultValue = "false") Boolean includeTiming){
        try {
            MultipleSectorsReturnRateHistoryResponse response = etfReturnRateService
                    .getMultipleSectorsReturnRateHistory(sectors, date, n, includeDetails, includeTiming);
            return Result.success(
                    response,
                    String.format("批量查询成功，共%d个类别", response.getSectorsCount()));
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            return Result.error(500, "服务器错误，无法批量查询类别收益率历史");
        }
    }

}
