package com.karthik.commandcentre.ai.controller;

import com.karthik.commandcentre.ai.dto.AiChatRequest;
import com.karthik.commandcentre.ai.dto.AiChatResponse;
import com.karthik.commandcentre.ai.dto.AiMentorContextDto;
import com.karthik.commandcentre.ai.dto.QuickActionRequest;
import com.karthik.commandcentre.ai.service.AiMentorService;
import com.karthik.commandcentre.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiMentorController {

    private final AiMentorService aiMentorService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiMentorService.chat(request);
        return ResponseEntity.ok(ApiResponse.success("AI Mentor response generated", response));
    }

    @GetMapping("/context")
    public ResponseEntity<ApiResponse<AiMentorContextDto>> getContext() {
        AiMentorContextDto context = aiMentorService.getMentorContext();
        return ResponseEntity.ok(ApiResponse.success("AI Mentor context loaded", context));
    }

    @PostMapping("/action")
    public ResponseEntity<ApiResponse<Map<String, Object>>> executeAction(@Valid @RequestBody QuickActionRequest request) {
        Map<String, Object> result = aiMentorService.executeQuickAction(request);
        return ResponseEntity.ok(ApiResponse.success((String) result.get("message"), result));
    }
}
