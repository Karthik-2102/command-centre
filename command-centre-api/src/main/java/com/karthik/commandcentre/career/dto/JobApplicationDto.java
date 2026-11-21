package com.karthik.commandcentre.career.dto;

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
public class JobApplicationDto {
    private Long id;
    private String company;
    private String role;
    private String eligibility;
    private LocalDate applicationDate;
    private String status; // APPLIED, IN_REVIEW, INTERVIEW, OFFERED, REJECTED, ACCEPTED
    private LocalDate followUpDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
