package com.karthik.commandcentre.career.dto;

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
public class CreateJobApplicationRequest {
    @NotBlank(message = "Company name is required")
    private String company;

    @NotBlank(message = "Role is required")
    private String role;

    private String eligibility;
    private LocalDate applicationDate;
    private String status; // APPLIED, IN_REVIEW, INTERVIEW, OFFERED, REJECTED, ACCEPTED
    private LocalDate followUpDate;
    private String notes;
}
