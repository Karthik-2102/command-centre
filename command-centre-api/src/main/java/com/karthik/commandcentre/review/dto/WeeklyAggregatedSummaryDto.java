package com.karthik.commandcentre.review.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyAggregatedSummaryDto {
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private BigDecimal totalStudyHours;
    private int dsaProblemsSolved;
    private int tasksCompleted;
    private int topicsCompleted;
    private int activeDaysCount;
    private String conceptsLearned;
    private String programsCompleted;
    private String bugsSolved;
    private String nextWeekGoal;
    private List<String> topicsCovered;
    private List<String> problemsSolved;
}
