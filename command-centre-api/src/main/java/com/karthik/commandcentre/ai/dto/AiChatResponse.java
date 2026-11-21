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
public class AiChatResponse {
    private String reply;
    private String currentStage;
    private String currentTopic;
    private String nextRecommendedTopic;
    private List<SuggestedAction> actions;
    private boolean isMockFallback;
    private String activeModel;
    private String provider; // "GEMINI", "GROQ", "OLLAMA", "LOCAL"
    private boolean fallbackTriggered;
    private String fallbackReason;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuggestedAction {
        private String id;
        private String type; // "TASK", "DSA"
        private String title;
        private String priority; // HIGH, MEDIUM, LOW
        private String category; // DSA, Learning, Backend
        private String difficulty; // EASY, MEDIUM, HARD
        private String platform; // LeetCode, HackerRank, GeeksForGeeks
        private String topic;
    }
}
