package com.karthik.commandcentre.dsa.dto;

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
public class UpdateDsaProblemRequest {
    @NotBlank(message = "Problem title is required")
    private String title;

    private String platform;
    private String topic;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    private String problemUrl;
    private LocalDate dateSolved;
    private String solutionNotes;
    private String timeComplexity;
    private String spaceComplexity;
    private String status;
}
