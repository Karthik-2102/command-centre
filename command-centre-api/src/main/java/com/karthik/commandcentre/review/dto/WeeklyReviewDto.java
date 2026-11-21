package com.karthik.commandcentre.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyReviewDto {
    private Long id;
    private LocalDate weekStartDate;
    private String conceptsLearned;
    private String programsCompleted;
    private String bugsSolved;
    private String unclearTopics;
    private String githubCommits;
    private Integer dsaProblemsSolved;
    private String nextWeekGoal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
