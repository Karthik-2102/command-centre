package com.karthik.commandcentre.calendar.service;

import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.OwnerRepository;
import com.karthik.commandcentre.calendar.dto.CalendarEventDto;
import com.karthik.commandcentre.calendar.dto.CreateCalendarEventRequest;
import com.karthik.commandcentre.calendar.dto.LogStudySessionRequest;
import com.karthik.commandcentre.calendar.dto.StudySessionDto;
import com.karthik.commandcentre.calendar.entity.CalendarEvent;
import com.karthik.commandcentre.calendar.entity.StudySession;
import com.karthik.commandcentre.calendar.repository.CalendarEventRepository;
import com.karthik.commandcentre.calendar.repository.StudySessionRepository;
import com.karthik.commandcentre.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarEventRepository calendarEventRepository;
    private final StudySessionRepository studySessionRepository;
    private final OwnerRepository ownerRepository;

    @Value("${app.owner.email:karthikvikash02@gmail.com}")
    private String defaultOwnerEmail;

    private Owner getOwner() {
        return ownerRepository.findByEmail(defaultOwnerEmail)
                .orElseGet(() -> ownerRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> ApiException.notFound("Owner profile not found.")));
    }

    @Transactional(readOnly = true)
    public List<CalendarEventDto> getEvents(LocalDate start, LocalDate end) {
        Owner owner = getOwner();
        List<CalendarEvent> events;

        if (start != null && end != null) {
            events = calendarEventRepository.findByOwnerIdAndEventDateBetweenOrderByStartTimeAsc(
                    owner.getId(), start, end);
        } else {
            events = calendarEventRepository.findAll().stream()
                    .filter(e -> e.getOwner().getId().equals(owner.getId()))
                    .collect(Collectors.toList());
        }

        return events.stream().map(this::mapToEventDto).collect(Collectors.toList());
    }

    @Transactional
    public CalendarEventDto createEvent(CreateCalendarEventRequest request) {
        Owner owner = getOwner();

        CalendarEvent event = CalendarEvent.builder()
                .owner(owner)
                .title(request.getTitle())
                .description(request.getDescription())
                .eventType(request.getEventType() != null ? request.getEventType().toUpperCase() : "STUDY")
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .isCompleted(false)
                .build();

        calendarEventRepository.save(event);
        return mapToEventDto(event);
    }

    @Transactional
    public CalendarEventDto updateEvent(Long id, CreateCalendarEventRequest request) {
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Calendar event not found with ID: " + id));

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        if (request.getEventType() != null) event.setEventType(request.getEventType().toUpperCase());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());

        calendarEventRepository.save(event);
        return mapToEventDto(event);
    }

    @Transactional
    public CalendarEventDto toggleEventCompletion(Long id) {
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Calendar event not found with ID: " + id));

        event.setIsCompleted(!Boolean.TRUE.equals(event.getIsCompleted()));
        calendarEventRepository.save(event);
        return mapToEventDto(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        if (!calendarEventRepository.existsById(id)) {
            throw ApiException.notFound("Calendar event not found with ID: " + id);
        }
        calendarEventRepository.deleteById(id);
    }

    @Transactional
    public StudySessionDto logStudySession(LogStudySessionRequest request) {
        Owner owner = getOwner();

        StudySession session = StudySession.builder()
                .owner(owner)
                .sessionDate(request.getSessionDate())
                .hours(request.getHours())
                .topic(request.getTopic())
                .notes(request.getNotes())
                .build();

        studySessionRepository.save(session);
        return mapToSessionDto(session);
    }

    @Transactional(readOnly = true)
    public List<StudySessionDto> getStudySessions(LocalDate start, LocalDate end) {
        Owner owner = getOwner();
        List<StudySession> sessions;

        if (start != null && end != null) {
            sessions = studySessionRepository.findByOwnerIdAndSessionDateBetweenOrderBySessionDateAsc(
                    owner.getId(), start, end);
        } else {
            sessions = studySessionRepository.findAll().stream()
                    .filter(s -> s.getOwner().getId().equals(owner.getId()))
                    .collect(Collectors.toList());
        }

        return sessions.stream().map(this::mapToSessionDto).collect(Collectors.toList());
    }

    private CalendarEventDto mapToEventDto(CalendarEvent e) {
        return CalendarEventDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .eventType(e.getEventType())
                .eventDate(e.getEventDate())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .isCompleted(e.getIsCompleted())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private StudySessionDto mapToSessionDto(StudySession s) {
        return StudySessionDto.builder()
                .id(s.getId())
                .sessionDate(s.getSessionDate())
                .hours(s.getHours())
                .topic(s.getTopic())
                .notes(s.getNotes())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
