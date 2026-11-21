package com.karthik.commandcentre.roadmap.repository;

import com.karthik.commandcentre.roadmap.entity.LearningTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LearningTopicRepository extends JpaRepository<LearningTopic, Long> {
    List<LearningTopic> findByStageIdOrderByDisplayOrderAsc(Long stageId);
    List<LearningTopic> findByStatusAndCompletionDateBetween(String status, LocalDate start, LocalDate end);
    long countByStatus(String status);
    long countByStageIdAndStatus(Long stageId, String status);
}
