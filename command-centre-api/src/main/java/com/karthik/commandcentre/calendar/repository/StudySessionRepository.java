package com.karthik.commandcentre.calendar.repository;

import com.karthik.commandcentre.calendar.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByOwnerIdAndSessionDateBetweenOrderBySessionDateAsc(
            Long ownerId, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(s.hours), 0) FROM StudySession s WHERE s.owner.id = :ownerId")
    BigDecimal getTotalHoursByOwnerId(Long ownerId);

    @Query("SELECT COALESCE(SUM(s.hours), 0) FROM StudySession s WHERE s.owner.id = :ownerId " +
           "AND s.sessionDate BETWEEN :start AND :end")
    BigDecimal getHoursBetween(Long ownerId, LocalDate start, LocalDate end);
}
