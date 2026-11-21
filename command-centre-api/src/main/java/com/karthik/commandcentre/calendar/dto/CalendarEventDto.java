package com.karthik.commandcentre.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEventDto {
    private Long id;
    private String title;
    private String description;
    private String eventType; // STUDY, TASK, DEADLINE, INTERVIEW, OTHER
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isCompleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
