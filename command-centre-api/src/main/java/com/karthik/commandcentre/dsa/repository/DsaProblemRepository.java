package com.karthik.commandcentre.dsa.repository;

import com.karthik.commandcentre.dsa.entity.DsaProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DsaProblemRepository extends JpaRepository<DsaProblem, Long> {
    List<DsaProblem> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<DsaProblem> findByOwnerIdAndStatus(Long ownerId, String status);
    List<DsaProblem> findByOwnerIdAndStatusAndDateSolvedBetween(Long ownerId, String status, LocalDate start, LocalDate end);
    long countByOwnerIdAndStatus(Long ownerId, String status);
    long countByOwnerIdAndDifficulty(Long ownerId, String difficulty);
    long countByOwnerIdAndTopic(Long ownerId, String topic);

    @Query("SELECT DISTINCT d.topic FROM DsaProblem d WHERE d.owner.id = :ownerId")
    List<String> findDistinctTopicsByOwnerId(Long ownerId);
}
