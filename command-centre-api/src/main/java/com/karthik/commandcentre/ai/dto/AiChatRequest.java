package com.karthik.commandcentre.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatRequest {
    @NotBlank(message = "Prompt cannot be empty")
    private String prompt;
    private String mode; // "GENERAL", "EXPLAIN", "PRACTICE", "CODE_REVIEW", "NEXT_TOPIC", "TASKS"
    private String preferredModel; // "AUTO", "GEMINI", "GROQ", "OLLAMA", "LOCAL"
    private String codeSnippet;
    private List<ChatMessage> conversationHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private String role; // "user" or "model"
        private String content;
    }
}
