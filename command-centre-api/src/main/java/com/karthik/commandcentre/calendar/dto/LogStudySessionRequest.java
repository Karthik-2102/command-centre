package com.karthik.commandcentre.calendar.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogStudySessionRequest {
    @NotNull(message = "Session date is required")
    private LocalDate sessionDate;

    @NotNull(message = "Hours logged is required")
    @DecimalMin(value = "0.1", message = "Hours must be greater than 0")
    private BigDecimal hours;

    private String topic;
    private String notes;
}
