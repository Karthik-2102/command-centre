package com.karthik.commandcentre.analytics.controller;

import com.karthik.commandcentre.analytics.dto.AnalyticsSummaryDto;
import com.karthik.commandcentre.analytics.dto.OverviewStatsDto;
import com.karthik.commandcentre.analytics.service.AnalyticsService;
import com.karthik.commandcentre.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview/stats")
    public ResponseEntity<ApiResponse<OverviewStatsDto>> getOverviewStats() {
        OverviewStatsDto stats = analyticsService.getOverviewStats();
        return ResponseEntity.ok(ApiResponse.success("Overview telemetry retrieved successfully.", stats));
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDto>> getAnalyticsSummary() {
        AnalyticsSummaryDto summary = analyticsService.getAnalyticsSummary();
        return ResponseEntity.ok(ApiResponse.success("Analytics intelligence retrieved successfully.", summary));
    }
}
