package com.karthik.commandcentre.dsa.controller;

import com.karthik.commandcentre.common.dto.ApiResponse;
import com.karthik.commandcentre.dsa.dto.CreateDsaProblemRequest;
import com.karthik.commandcentre.dsa.dto.DsaProblemDto;
import com.karthik.commandcentre.dsa.dto.DsaStatsResponseDto;
import com.karthik.commandcentre.dsa.dto.UpdateDsaProblemRequest;
import com.karthik.commandcentre.dsa.service.DsaProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dsa")
@RequiredArgsConstructor
public class DsaProblemController {

    private final DsaProblemService dsaProblemService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DsaProblemDto>>> getProblems(
            @RequestParam(required = false, defaultValue = "ALL") String difficulty,
            @RequestParam(required = false, defaultValue = "ALL") String topic,
            @RequestParam(required = false, defaultValue = "ALL") String platform,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String query) {
        List<DsaProblemDto> problems = dsaProblemService.getProblems(difficulty, topic, platform, status, query);
        return ResponseEntity.ok(ApiResponse.success("DSA problems retrieved successfully.", problems));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DsaStatsResponseDto>> getStats() {
        DsaStatsResponseDto stats = dsaProblemService.getDsaStats();
        return ResponseEntity.ok(ApiResponse.success("DSA statistics retrieved successfully.", stats));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DsaProblemDto>> getProblemById(@PathVariable Long id) {
        DsaProblemDto problem = dsaProblemService.getProblemById(id);
        return ResponseEntity.ok(ApiResponse.success("DSA problem retrieved successfully.", problem));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DsaProblemDto>> createProblem(
            @Valid @RequestBody CreateDsaProblemRequest request) {
        DsaProblemDto problem = dsaProblemService.createProblem(request);
        return ResponseEntity.ok(ApiResponse.success("DSA problem logged successfully.", problem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DsaProblemDto>> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDsaProblemRequest request) {
        DsaProblemDto updated = dsaProblemService.updateProblem(id, request);
        return ResponseEntity.ok(ApiResponse.success("DSA problem updated successfully.", updated));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<DsaProblemDto>> toggleProblemStatus(@PathVariable Long id) {
        DsaProblemDto updated = dsaProblemService.toggleProblemStatus(id);
        return ResponseEntity.ok(ApiResponse.success("DSA problem status updated.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProblem(@PathVariable Long id) {
        dsaProblemService.deleteProblem(id);
        return ResponseEntity.ok(ApiResponse.success("DSA problem deleted successfully."));
    }
}
