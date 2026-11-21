package com.karthik.commandcentre.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionDto {
    private Long id;
    private LocalDate sessionDate;
    private BigDecimal hours;
    private String topic;
    private String notes;
    private LocalDateTime createdAt;
}
