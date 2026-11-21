package com.karthik.commandcentre.project.controller;

import com.karthik.commandcentre.common.dto.ApiResponse;
import com.karthik.commandcentre.project.dto.CreateProjectRequest;
import com.karthik.commandcentre.project.dto.ProjectDto;
import com.karthik.commandcentre.project.dto.UpdateProjectRequest;
import com.karthik.commandcentre.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getProjects(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String query) {
        List<ProjectDto> projects = projectService.getProjects(status, query);
        return ResponseEntity.ok(ApiResponse.success("Projects retrieved successfully.", projects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDto>> getProjectById(@PathVariable Long id) {
        ProjectDto project = projectService.getProjectById(id);
        return ResponseEntity.ok(ApiResponse.success("Project retrieved successfully.", project));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectDto project = projectService.createProject(request);
        return ResponseEntity.ok(ApiResponse.success("Project created successfully.", project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request) {
        ProjectDto updated = projectService.updateProject(id, request);
        return ResponseEntity.ok(ApiResponse.success("Project updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success("Project deleted successfully."));
    }
}
