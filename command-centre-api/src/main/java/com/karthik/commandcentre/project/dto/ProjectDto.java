package com.karthik.commandcentre.project.dto;

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
public class ProjectDto {
    private Long id;
    private String name;
    private String description;
    private String techStack;
    private String githubUrl;
    private String liveUrl;
    private String status; // PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD
    private LocalDate startDate;
    private LocalDate completionDate;
    private String featuresCompleted;
    private String featuresPending;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
