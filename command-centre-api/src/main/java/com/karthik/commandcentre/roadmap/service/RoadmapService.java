package com.karthik.commandcentre.roadmap.service;

import com.karthik.commandcentre.common.exception.ApiException;
import com.karthik.commandcentre.roadmap.dto.LearningStageDto;
import com.karthik.commandcentre.roadmap.dto.LearningTopicDto;
import com.karthik.commandcentre.roadmap.dto.UpdateTopicRequest;
import com.karthik.commandcentre.roadmap.entity.LearningStage;
import com.karthik.commandcentre.roadmap.entity.LearningTopic;
import com.karthik.commandcentre.roadmap.repository.LearningStageRepository;
import com.karthik.commandcentre.roadmap.repository.LearningTopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoadmapService {

    private final LearningStageRepository stageRepository;
    private final LearningTopicRepository topicRepository;

    @Transactional(readOnly = true)
    public List<LearningStageDto> getAllStagesWithTopics() {
        List<LearningStage> stages = stageRepository.findAllByOrderByDisplayOrderAsc();

        return stages.stream()
                .map(this::mapToStageDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LearningStageDto getStageById(Long id) {
        LearningStage stage = stageRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Learning stage with ID " + id + " not found."));
        return mapToStageDto(stage);
    }

    @Transactional
    public LearningTopicDto updateTopic(Long topicId, UpdateTopicRequest request) {
        LearningTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> ApiException.notFound("Learning topic with ID " + topicId + " not found."));

        String newStatus = request.getStatus().toUpperCase();

        topic.setStatus(newStatus);
        topic.setNotes(request.getNotes());
        topic.setResources(request.getResources());

        // Date automation
        if ("IN_PROGRESS".equals(newStatus)) {
            topic.setStartDate(request.getStartDate() != null ? request.getStartDate()
                    : (topic.getStartDate() != null ? topic.getStartDate() : LocalDate.now()));
            topic.setCompletionDate(null);
        } else if ("COMPLETED".equals(newStatus)) {
            if (topic.getStartDate() == null) {
                topic.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
            }
            topic.setCompletionDate(
                    request.getCompletionDate() != null ? request.getCompletionDate() : LocalDate.now());
        } else if ("NOT_STARTED".equals(newStatus)) {
            topic.setStartDate(request.getStartDate());
            topic.setCompletionDate(null);
        }

        topicRepository.save(topic);

        // Update stage status dynamically based on topic statuses
        updateStageStatus(topic.getStage());

        return mapToTopicDto(topic);
    }

    private void updateStageStatus(LearningStage stage) {
        List<LearningTopic> topics = topicRepository.findByStageIdOrderByDisplayOrderAsc(stage.getId());
        if (topics.isEmpty())
            return;

        long completed = topics.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long inProgress = topics.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count();

        if (completed == topics.size()) {
            stage.setStatus("COMPLETED");
        } else if (completed > 0 || inProgress > 0) {
            stage.setStatus("IN_PROGRESS");
        } else {
            stage.setStatus("NOT_STARTED");
        }
        stageRepository.save(stage);
    }

    private LearningStageDto mapToStageDto(LearningStage stage) {
        List<LearningTopic> topics = stage.getTopics();
        int total = topics != null ? topics.size() : 0;
        int completed = topics != null
                ? (int) topics.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count()
                : 0;
        int pct = total > 0 ? (int) Math.round(((double) completed / total) * 100) : 0;

        List<LearningTopicDto> topicDtos = topics != null ? topics.stream()
                .map(this::mapToTopicDto)
                .collect(Collectors.toList()) : List.of();

        return LearningStageDto.builder()
                .id(stage.getId())
                .stageNumber(stage.getStageNumber())
                .title(stage.getTitle())
                .description(stage.getDescription())
                .monthRange(stage.getMonthRange())
                .status(stage.getStatus())
                .displayOrder(stage.getDisplayOrder())
                .totalTopics(total)
                .completedTopics(completed)
                .progressPercentage(pct)
                .topics(topicDtos)
                .build();
    }

    private LearningTopicDto mapToTopicDto(LearningTopic topic) {
        return LearningTopicDto.builder()
                .id(topic.getId())
                .stageId(topic.getStage().getId())
                .title(topic.getTitle())
                .notes(topic.getNotes())
                .resources(topic.getResources())
                .status(topic.getStatus())
                .startDate(topic.getStartDate())
                .completionDate(topic.getCompletionDate())
                .displayOrder(topic.getDisplayOrder())
                .updatedAt(topic.getUpdatedAt())
                .build();
    }
}
