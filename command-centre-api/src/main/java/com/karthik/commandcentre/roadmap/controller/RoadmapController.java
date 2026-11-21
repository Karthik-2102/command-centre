package com.karthik.commandcentre.roadmap.controller;

import com.karthik.commandcentre.common.dto.ApiResponse;
import com.karthik.commandcentre.roadmap.dto.LearningStageDto;
import com.karthik.commandcentre.roadmap.dto.LearningTopicDto;
import com.karthik.commandcentre.roadmap.dto.UpdateTopicRequest;
import com.karthik.commandcentre.roadmap.service.RoadmapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;

    @GetMapping("/stages")
    public ResponseEntity<ApiResponse<List<LearningStageDto>>> getAllStages() {
        List<LearningStageDto> stages = roadmapService.getAllStagesWithTopics();
        return ResponseEntity.ok(ApiResponse.success("Learning stages retrieved successfully.", stages));
    }

    @GetMapping("/stages/{id}")
    public ResponseEntity<ApiResponse<LearningStageDto>> getStageById(@PathVariable Long id) {
        LearningStageDto stage = roadmapService.getStageById(id);
        return ResponseEntity.ok(ApiResponse.success("Learning stage retrieved successfully.", stage));
    }

    @PutMapping("/topics/{id}")
    public ResponseEntity<ApiResponse<LearningTopicDto>> updateTopic(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTopicRequest request) {
        LearningTopicDto updated = roadmapService.updateTopic(id, request);
        return ResponseEntity.ok(ApiResponse.success("Topic progress updated successfully.", updated));
    }
}
