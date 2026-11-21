package com.karthik.commandcentre.calendar.repository;

import com.karthik.commandcentre.calendar.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByOwnerIdAndEventDateBetweenOrderByStartTimeAsc(
            Long ownerId, LocalDate start, LocalDate end);
    List<CalendarEvent> findByOwnerIdAndEventDateOrderByStartTimeAsc(Long ownerId, LocalDate date);
}
