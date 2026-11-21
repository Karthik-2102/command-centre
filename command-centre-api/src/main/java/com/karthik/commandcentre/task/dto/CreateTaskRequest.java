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
public class CreateTaskRequest {
    @NotBlank(message = "Task title is required")
    private String title;

    private String description;
    private String priority; // HIGH, MEDIUM, LOW
    private String category;
    private LocalDate dueDate;
}
