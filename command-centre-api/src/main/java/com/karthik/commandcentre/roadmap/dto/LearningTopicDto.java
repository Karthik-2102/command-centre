package com.karthik.commandcentre.roadmap.dto;

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
public class LearningTopicDto {
    private Long id;
    private Long stageId;
    private String title;
    private String notes;
    private String resources;
    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED
    private LocalDate startDate;
    private LocalDate completionDate;
    private Integer displayOrder;
    private LocalDateTime updatedAt;
}
