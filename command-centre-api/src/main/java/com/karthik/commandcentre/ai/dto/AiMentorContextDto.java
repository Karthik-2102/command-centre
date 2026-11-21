package com.karthik.commandcentre.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiMentorContextDto {
    private String stageTitle;
    private Integer stageNumber;
    private String monthRange;
    private int completedTopicsCount;
    private int totalTopicsCount;
    private int progressPercentage;
    private List<String> completedTopics;
    private List<String> inProgressTopics;
    private String nextRecommendedTopic;
    private List<String> upcomingTopicsInCurrentStage;
    private int solvedDsaCount;
    private int pendingTasksCount;
    private boolean hasGeminiApiKey;
    private boolean hasGroqApiKey;
    private boolean isOllamaConfigured;
    private List<String> availableModels;
}
