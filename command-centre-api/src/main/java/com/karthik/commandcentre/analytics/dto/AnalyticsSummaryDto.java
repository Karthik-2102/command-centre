package com.karthik.commandcentre.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDto {
    private BigDecimal dailyAverageHours;
    private BigDecimal thisWeekHours;
    private BigDecimal thisMonthHours;
    private BigDecimal allTimeHours;
    private int roadmapCompletionPercentage;
    private long totalTopics;
    private long completedTopics;
    private long inProgressTopics;
    private long notStartedTopics;

    // Task Analytics
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private int taskCompletionRate;

    // DSA Analytics
    private long totalDsaSolved;
    private long easyDsaSolved;
    private long mediumDsaSolved;
    private long hardDsaSolved;
    private List<DsaTopicBreakdown> dsaTopicDistribution;

    // Project Analytics
    private long totalProjects;
    private long inProgressProjects;
    private long completedProjects;

    // Charts
    private List<MonthlyStudyTrendPoint> monthlyStudyTrend;
    private List<DsaDifficultyPoint> dsaDifficultyChart;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DsaTopicBreakdown {
        private String topic;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStudyTrendPoint {
        private String month;
        private BigDecimal hours;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DsaDifficultyPoint {
        private String difficulty; // "Easy", "Medium", "Hard"
        private long count;
        private String fill;       // "#10b981", "#eab308", "#ef4444"
    }
}
