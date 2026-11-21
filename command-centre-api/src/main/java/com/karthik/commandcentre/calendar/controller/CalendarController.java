package com.karthik.commandcentre.calendar.controller;

import com.karthik.commandcentre.calendar.dto.CalendarEventDto;
import com.karthik.commandcentre.calendar.dto.CreateCalendarEventRequest;
import com.karthik.commandcentre.calendar.dto.LogStudySessionRequest;
import com.karthik.commandcentre.calendar.dto.StudySessionDto;
import com.karthik.commandcentre.calendar.service.CalendarService;
import com.karthik.commandcentre.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<CalendarEventDto>>> getEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<CalendarEventDto> events = calendarService.getEvents(start, end);
        return ResponseEntity.ok(ApiResponse.success("Calendar events retrieved successfully.", events));
    }

    @PostMapping("/events")
    public ResponseEntity<ApiResponse<CalendarEventDto>> createEvent(
            @Valid @RequestBody CreateCalendarEventRequest request) {
        CalendarEventDto event = calendarService.createEvent(request);
        return ResponseEntity.ok(ApiResponse.success("Calendar event scheduled successfully.", event));
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<ApiResponse<CalendarEventDto>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody CreateCalendarEventRequest request) {
        CalendarEventDto updated = calendarService.updateEvent(id, request);
        return ResponseEntity.ok(ApiResponse.success("Calendar event updated successfully.", updated));
    }

    @PatchMapping("/events/{id}/toggle")
    public ResponseEntity<ApiResponse<CalendarEventDto>> toggleEvent(@PathVariable Long id) {
        CalendarEventDto updated = calendarService.toggleEventCompletion(id);
        return ResponseEntity.ok(ApiResponse.success("Calendar event status updated.", updated));
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        calendarService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Calendar event deleted successfully."));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<StudySessionDto>>> getStudySessions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<StudySessionDto> sessions = calendarService.getStudySessions(start, end);
        return ResponseEntity.ok(ApiResponse.success("Study sessions retrieved successfully.", sessions));
    }

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<StudySessionDto>> logStudySession(
            @Valid @RequestBody LogStudySessionRequest request) {
        StudySessionDto session = calendarService.logStudySession(request);
        return ResponseEntity.ok(ApiResponse.success("Study session logged successfully.", session));
    }
}
