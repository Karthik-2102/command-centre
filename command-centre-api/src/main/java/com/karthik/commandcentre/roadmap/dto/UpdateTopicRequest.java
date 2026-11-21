package com.karthik.commandcentre.roadmap.dto;

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
public class UpdateTopicRequest {
    @NotBlank(message = "Status is required")
    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED

    private String notes;
    private String resources;
    private LocalDate startDate;
    private LocalDate completionDate;
}
