package com.karthik.commandcentre.roadmap.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningStageDto {
    private Long id;
    private Integer stageNumber;
    private String title;
    private String description;
    private String monthRange;
    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED
    private Integer displayOrder;
    private int totalTopics;
    private int completedTopics;
    private int progressPercentage;
    private List<LearningTopicDto> topics;
}
