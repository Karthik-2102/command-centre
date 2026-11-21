package com.karthik.commandcentre.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuickActionRequest {
    private String actionType; // "TASK" or "DSA"
    private String title;
    private String description;
    private String priority;
    private String category;
    private String platform;
    private String topic;
    private String difficulty;
}
