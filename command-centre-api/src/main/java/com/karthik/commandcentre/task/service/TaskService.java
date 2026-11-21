package com.karthik.commandcentre.task.service;

import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.OwnerRepository;
import com.karthik.commandcentre.common.exception.ApiException;
import com.karthik.commandcentre.task.dto.CreateTaskRequest;
import com.karthik.commandcentre.task.dto.TaskDto;
import com.karthik.commandcentre.task.dto.UpdateTaskRequest;
import com.karthik.commandcentre.task.entity.Task;
import com.karthik.commandcentre.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final OwnerRepository ownerRepository;

    @Value("${app.owner.email:karthikvikash02@gmail.com}")
    private String defaultOwnerEmail;

    private Owner getOwner() {
        return ownerRepository.findByEmail(defaultOwnerEmail)
                .orElseGet(() -> ownerRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> ApiException.notFound("Owner profile not found.")));
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasks(String view, String status, String priority, String category, String query) {
        Owner owner = getOwner();
        Long ownerId = owner.getId();
        LocalDate today = LocalDate.now();

        List<Task> tasks;

        if ("daily".equalsIgnoreCase(view)) {
            tasks = taskRepository.findByOwnerIdAndDueDate(ownerId, today);
        } else if ("weekly".equalsIgnoreCase(view)) {
            LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            tasks = taskRepository.findByOwnerIdAndDueDateBetween(ownerId, weekStart, weekEnd);
        } else {
            tasks = taskRepository.findAll().stream()
                    .filter(t -> t.getOwner().getId().equals(ownerId))
                    .collect(Collectors.toList());
        }

        return tasks.stream()
                .filter(t -> status == null || status.isBlank() || "ALL".equalsIgnoreCase(status) || t.getStatus().equalsIgnoreCase(status))
                .filter(t -> priority == null || priority.isBlank() || "ALL".equalsIgnoreCase(priority) || t.getPriority().equalsIgnoreCase(priority))
                .filter(t -> category == null || category.isBlank() || "ALL".equalsIgnoreCase(category) || (t.getCategory() != null && t.getCategory().equalsIgnoreCase(category)))
                .filter(t -> {
                    if (query == null || query.isBlank()) return true;
                    String q = query.toLowerCase();
                    boolean inTitle = t.getTitle() != null && t.getTitle().toLowerCase().contains(q);
                    boolean inDesc = t.getDescription() != null && t.getDescription().toLowerCase().contains(q);
                    return inTitle || inDesc;
                })
                .sorted((a, b) -> {
                    // Pending tasks first, then by priority (HIGH, MEDIUM, LOW), then by dueDate
                    if (!a.getStatus().equals(b.getStatus())) {
                        return a.getStatus().equals("PENDING") ? -1 : 1;
                    }
                    int pA = priorityWeight(a.getPriority());
                    int pB = priorityWeight(b.getPriority());
                    if (pA != pB) return Integer.compare(pB, pA);
                    if (a.getDueDate() != null && b.getDueDate() != null) {
                        return a.getDueDate().compareTo(b.getDueDate());
                    }
                    return 0;
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Task not found with ID: " + id));
        return mapToDto(task);
    }

    @Transactional
    public TaskDto createTask(CreateTaskRequest request) {
        Owner owner = getOwner();

        Task task = Task.builder()
                .owner(owner)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM")
                .category(request.getCategory() != null ? request.getCategory() : "Study")
                .status("PENDING")
                .dueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now())
                .build();

        taskRepository.save(task);
        return mapToDto(task);
    }

    @Transactional
    public TaskDto updateTask(Long id, UpdateTaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Task not found with ID: " + id));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority().toUpperCase());
        if (request.getCategory() != null) task.setCategory(request.getCategory());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        if (request.getStatus() != null) {
            String newStatus = request.getStatus().toUpperCase();
            if ("COMPLETED".equals(newStatus) && !"COMPLETED".equals(task.getStatus())) {
                task.setCompletedAt(LocalDateTime.now());
            } else if ("PENDING".equals(newStatus)) {
                task.setCompletedAt(null);
            }
            task.setStatus(newStatus);
        }

        taskRepository.save(task);
        return mapToDto(task);
    }

    @Transactional
    public TaskDto toggleTaskStatus(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Task not found with ID: " + id));

        if ("PENDING".equals(task.getStatus())) {
            task.setStatus("COMPLETED");
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setStatus("PENDING");
            task.setCompletedAt(null);
        }

        taskRepository.save(task);
        return mapToDto(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw ApiException.notFound("Task not found with ID: " + id);
        }
        taskRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getTaskSummary() {
        Owner owner = getOwner();
        Long ownerId = owner.getId();
        LocalDate today = LocalDate.now();

        long pending = taskRepository.countByOwnerIdAndStatus(ownerId, "PENDING");
        long completed = taskRepository.countByOwnerIdAndStatus(ownerId, "COMPLETED");
        long todayCount = taskRepository.findByOwnerIdAndDueDate(ownerId, today).size();

        return Map.of(
                "total", pending + completed,
                "pending", pending,
                "completed", completed,
                "today", todayCount
        );
    }

    private int priorityWeight(String priority) {
        if ("HIGH".equalsIgnoreCase(priority)) return 3;
        if ("MEDIUM".equalsIgnoreCase(priority)) return 2;
        return 1;
    }

    private TaskDto mapToDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .category(task.getCategory())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .completedAt(task.getCompletedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
