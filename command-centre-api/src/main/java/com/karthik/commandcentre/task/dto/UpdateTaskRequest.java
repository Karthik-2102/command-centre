package com.karthik.commandcentre.task.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {
    @NotBlank(message = "Task title is required")
    private String title;

    private String description;
    private String priority;
    private String category;
    private String status; // PENDING, COMPLETED
    private LocalDate dueDate;
}
