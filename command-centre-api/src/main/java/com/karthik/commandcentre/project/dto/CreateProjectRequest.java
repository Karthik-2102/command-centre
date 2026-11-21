package com.karthik.commandcentre.project.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {
    @NotBlank(message = "Project name is required")
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
}
