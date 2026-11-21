package com.karthik.commandcentre.roadmap.repository;

import com.karthik.commandcentre.roadmap.entity.LearningStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningStageRepository extends JpaRepository<LearningStage, Long> {
    @Query("SELECT DISTINCT s FROM LearningStage s LEFT JOIN FETCH s.topics ORDER BY s.displayOrder ASC")
    List<LearningStage> findAllByOrderByDisplayOrderAsc();
}
