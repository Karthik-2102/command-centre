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
public class OverviewStatsDto {
    private int overallProgressPercentage;
    private String currentStageTitle;
    private int currentStageNumber;
    private String currentMonth;
    private BigDecimal totalStudyHours;
    private BigDecimal todayStudyHours;
    private BigDecimal weeklyStudyHours;
    private long completedTopics;
    private long inProgressTopics;
    private long pendingTopics;
    private long totalTopics;
    private long dsaProblemsSolved;
    private long activeProjects;
    private int currentStreakDays;
    private List<TodayPriorityDto> todayPriorities;
    private List<WeeklyStudyHourPoint> weeklyStudyChart;
    private List<StageProgressPoint> stageProgressChart;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TodayPriorityDto {
        private Long id;
        private String title;
        private String priority; // HIGH, MEDIUM, LOW
        private String category;
        private String status;   // PENDING, COMPLETED
        private String dueDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyStudyHourPoint {
        private String day;       // "Mon", "Tue", etc.
        private String date;      // "2026-11-16"
        private BigDecimal hours; // 3.0
        private BigDecimal targetHours; // 3.0
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StageProgressPoint {
        private String stage;      // "Stage 1", "Stage 2"
        private String title;      // "Java Fundamentals"
        private int totalTopics;
        private int completedTopics;
        private int percentage;
    }
}
