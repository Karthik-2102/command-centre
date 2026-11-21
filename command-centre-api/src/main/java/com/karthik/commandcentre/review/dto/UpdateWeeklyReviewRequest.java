package com.karthik.commandcentre.review.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWeeklyReviewRequest {
    @NotNull(message = "Week start date is required")
    private LocalDate weekStartDate;

    private String conceptsLearned;
    private String programsCompleted;
    private String bugsSolved;
    private String unclearTopics;
    private String githubCommits;
    private Integer dsaProblemsSolved;
    private String nextWeekGoal;
}
