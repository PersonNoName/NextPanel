package com.ives.api.controller;

import com.ives.api.common.api.Result;
import com.ives.api.model.dto.TradingDaysResponse;
import com.ives.api.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trading-days")
@RequiredArgsConstructor
public class CalendarController {
    private final CalendarService calendarService;

    @GetMapping("/previous")
    public Result<TradingDaysResponse> getPreviousTradingDays(
            @RequestParam String date,
            @RequestParam Integer n) {
        try {
            TradingDaysResponse response = calendarService.getPreviousTradingDays(date, n);
            return Result.success(response);
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }
}
