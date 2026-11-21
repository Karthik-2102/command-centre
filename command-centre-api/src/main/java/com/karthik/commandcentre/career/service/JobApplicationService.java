package com.karthik.commandcentre.career.service;

import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.OwnerRepository;
import com.karthik.commandcentre.career.dto.CreateJobApplicationRequest;
import com.karthik.commandcentre.career.dto.JobApplicationDto;
import com.karthik.commandcentre.career.dto.UpdateJobApplicationRequest;
import com.karthik.commandcentre.career.entity.JobApplication;
import com.karthik.commandcentre.career.repository.JobApplicationRepository;
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
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final OwnerRepository ownerRepository;

    @Value("${app.owner.email:karthikvikash02@gmail.com}")
    private String defaultOwnerEmail;

    private Owner getOwner() {
        return ownerRepository.findByEmail(defaultOwnerEmail)
                .orElseGet(() -> ownerRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> ApiException.notFound("Owner profile not found.")));
    }

    @Transactional(readOnly = true)
    public List<JobApplicationDto> getApplications(String status, String query) {
        Owner owner = getOwner();
        List<JobApplication> apps = jobApplicationRepository.findByOwnerIdOrderByApplicationDateDesc(owner.getId());

        return apps.stream()
                .filter(a -> status == null || status.isBlank() || "ALL".equalsIgnoreCase(status) || a.getStatus().equalsIgnoreCase(status))
                .filter(a -> {
                    if (query == null || query.isBlank()) return true;
                    String q = query.toLowerCase();
                    boolean inCompany = a.getCompany() != null && a.getCompany().toLowerCase().contains(q);
                    boolean inRole = a.getRole() != null && a.getRole().toLowerCase().contains(q);
                    boolean inNotes = a.getNotes() != null && a.getNotes().toLowerCase().contains(q);
                    return inCompany || inRole || inNotes;
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobApplicationDto getApplicationById(Long id) {
        JobApplication app = jobApplicationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Job Application not found with ID: " + id));
        return mapToDto(app);
    }

    @Transactional
    public JobApplicationDto createApplication(CreateJobApplicationRequest request) {
        Owner owner = getOwner();

        String status = request.getStatus() != null && !request.getStatus().isBlank()
                ? request.getStatus().toUpperCase() : "APPLIED";

        LocalDate appDate = request.getApplicationDate() != null
                ? request.getApplicationDate() : LocalDate.now();

        JobApplication app = JobApplication.builder()
                .owner(owner)
                .company(request.getCompany())
                .role(request.getRole())
                .eligibility(request.getEligibility())
                .applicationDate(appDate)
                .status(status)
                .followUpDate(request.getFollowUpDate())
                .notes(request.getNotes())
                .build();

        jobApplicationRepository.save(app);
        return mapToDto(app);
    }

    @Transactional
    public JobApplicationDto updateApplication(Long id, UpdateJobApplicationRequest request) {
        JobApplication app = jobApplicationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Job Application not found with ID: " + id));

        app.setCompany(request.getCompany());
        app.setRole(request.getRole());
        app.setEligibility(request.getEligibility());
        app.setApplicationDate(request.getApplicationDate());
        if (request.getStatus() != null) app.setStatus(request.getStatus().toUpperCase());
        app.setFollowUpDate(request.getFollowUpDate());
        app.setNotes(request.getNotes());

        jobApplicationRepository.save(app);
        return mapToDto(app);
    }

    @Transactional
    public void deleteApplication(Long id) {
        if (!jobApplicationRepository.existsById(id)) {
            throw ApiException.notFound("Job Application not found with ID: " + id);
        }
        jobApplicationRepository.deleteById(id);
    }

    private JobApplicationDto mapToDto(JobApplication a) {
        return JobApplicationDto.builder()
                .id(a.getId())
                .company(a.getCompany())
                .role(a.getRole())
                .eligibility(a.getEligibility())
                .applicationDate(a.getApplicationDate())
                .status(a.getStatus())
                .followUpDate(a.getFollowUpDate())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
