package com.karthik.commandcentre.task.controller;

import com.karthik.commandcentre.common.dto.ApiResponse;
import com.karthik.commandcentre.task.dto.CreateTaskRequest;
import com.karthik.commandcentre.task.dto.TaskDto;
import com.karthik.commandcentre.task.dto.UpdateTaskRequest;
import com.karthik.commandcentre.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskDto>>> getTasks(
            @RequestParam(required = false, defaultValue = "all") String view,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "ALL") String priority,
            @RequestParam(required = false, defaultValue = "ALL") String category,
            @RequestParam(required = false) String query) {
        List<TaskDto> tasks = taskService.getTasks(view, status, priority, category, query);
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully.", tasks));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getTaskSummary() {
        Map<String, Long> summary = taskService.getTaskSummary();
        return ResponseEntity.ok(ApiResponse.success("Task summary retrieved successfully.", summary));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> getTaskById(@PathVariable Long id) {
        TaskDto task = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success("Task retrieved successfully.", task));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskDto>> createTask(@Valid @RequestBody CreateTaskRequest request) {
        TaskDto task = taskService.createTask(request);
        return ResponseEntity.ok(ApiResponse.success("Task created successfully.", task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {
        TaskDto updated = taskService.updateTask(id, request);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully.", updated));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<TaskDto>> toggleTaskStatus(@PathVariable Long id) {
        TaskDto updated = taskService.toggleTaskStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Task status updated.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully."));
    }
}
