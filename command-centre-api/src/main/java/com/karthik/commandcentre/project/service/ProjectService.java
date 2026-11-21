package com.karthik.commandcentre.project.service;

import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.OwnerRepository;
import com.karthik.commandcentre.common.exception.ApiException;
import com.karthik.commandcentre.project.dto.CreateProjectRequest;
import com.karthik.commandcentre.project.dto.ProjectDto;
import com.karthik.commandcentre.project.dto.UpdateProjectRequest;
import com.karthik.commandcentre.project.entity.Project;
import com.karthik.commandcentre.project.repository.ProjectRepository;
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
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final OwnerRepository ownerRepository;

    @Value("${app.owner.email:karthikvikash02@gmail.com}")
    private String defaultOwnerEmail;

    private Owner getOwner() {
        return ownerRepository.findByEmail(defaultOwnerEmail)
                .orElseGet(() -> ownerRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> ApiException.notFound("Owner profile not found.")));
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getProjects(String status, String query) {
        Owner owner = getOwner();
        List<Project> projects = projectRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId());

        return projects.stream()
                .filter(p -> status == null || status.isBlank() || "ALL".equalsIgnoreCase(status) || p.getStatus().equalsIgnoreCase(status))
                .filter(p -> {
                    if (query == null || query.isBlank()) return true;
                    String q = query.toLowerCase();
                    boolean inName = p.getName() != null && p.getName().toLowerCase().contains(q);
                    boolean inDesc = p.getDescription() != null && p.getDescription().toLowerCase().contains(q);
                    boolean inTech = p.getTechStack() != null && p.getTechStack().toLowerCase().contains(q);
                    return inName || inDesc || inTech;
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Project not found with ID: " + id));
        return mapToDto(project);
    }

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request) {
        Owner owner = getOwner();

        String status = request.getStatus() != null && !request.getStatus().isBlank()
                ? request.getStatus().toUpperCase() : "PLANNED";

        LocalDate startDate = request.getStartDate();
        if ("IN_PROGRESS".equals(status) && startDate == null) {
            startDate = LocalDate.now();
        }

        Project project = Project.builder()
                .owner(owner)
                .name(request.getName())
                .description(request.getDescription())
                .techStack(request.getTechStack())
                .githubUrl(request.getGithubUrl())
                .liveUrl(request.getLiveUrl())
                .status(status)
                .startDate(startDate)
                .completionDate(request.getCompletionDate())
                .featuresCompleted(request.getFeaturesCompleted())
                .featuresPending(request.getFeaturesPending())
                .build();

        projectRepository.save(project);
        return mapToDto(project);
    }

    @Transactional
    public ProjectDto updateProject(Long id, UpdateProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Project not found with ID: " + id));

        String newStatus = request.getStatus() != null ? request.getStatus().toUpperCase() : project.getStatus();

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setTechStack(request.getTechStack());
        project.setGithubUrl(request.getGithubUrl());
        project.setLiveUrl(request.getLiveUrl());
        project.setStatus(newStatus);
        project.setFeaturesCompleted(request.getFeaturesCompleted());
        project.setFeaturesPending(request.getFeaturesPending());

        if (request.getStartDate() != null) {
            project.setStartDate(request.getStartDate());
        }
        if ("COMPLETED".equals(newStatus) && project.getCompletionDate() == null) {
            project.setCompletionDate(request.getCompletionDate() != null ? request.getCompletionDate() : LocalDate.now());
        } else if (request.getCompletionDate() != null) {
            project.setCompletionDate(request.getCompletionDate());
        }

        projectRepository.save(project);
        return mapToDto(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw ApiException.notFound("Project not found with ID: " + id);
        }
        projectRepository.deleteById(id);
    }

    private ProjectDto mapToDto(Project p) {
        return ProjectDto.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .techStack(p.getTechStack())
                .githubUrl(p.getGithubUrl())
                .liveUrl(p.getLiveUrl())
                .status(p.getStatus())
                .startDate(p.getStartDate())
                .completionDate(p.getCompletionDate())
                .featuresCompleted(p.getFeaturesCompleted())
                .featuresPending(p.getFeaturesPending())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
