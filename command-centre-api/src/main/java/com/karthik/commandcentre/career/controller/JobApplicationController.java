package com.karthik.commandcentre.career.controller;

import com.karthik.commandcentre.career.dto.CreateJobApplicationRequest;
import com.karthik.commandcentre.career.dto.JobApplicationDto;
import com.karthik.commandcentre.career.dto.UpdateJobApplicationRequest;
import com.karthik.commandcentre.career.service.JobApplicationService;
import com.karthik.commandcentre.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobApplicationDto>>> getApplications(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String query) {
        List<JobApplicationDto> apps = jobApplicationService.getApplications(status, query);
        return ResponseEntity.ok(ApiResponse.success("Job applications retrieved successfully.", apps));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobApplicationDto>> getApplicationById(@PathVariable Long id) {
        JobApplicationDto app = jobApplicationService.getApplicationById(id);
        return ResponseEntity.ok(ApiResponse.success("Job application retrieved successfully.", app));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobApplicationDto>> createApplication(
            @Valid @RequestBody CreateJobApplicationRequest request) {
        JobApplicationDto app = jobApplicationService.createApplication(request);
        return ResponseEntity.ok(ApiResponse.success("Job application tracked successfully.", app));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobApplicationDto>> updateApplication(
            @PathVariable Long id,
            @Valid @RequestBody UpdateJobApplicationRequest request) {
        JobApplicationDto updated = jobApplicationService.updateApplication(id, request);
        return ResponseEntity.ok(ApiResponse.success("Job application updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(@PathVariable Long id) {
        jobApplicationService.deleteApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Job application deleted successfully."));
    }
}
