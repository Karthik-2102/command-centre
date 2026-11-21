package com.karthik.commandcentre.review.controller;

import com.karthik.commandcentre.common.dto.ApiResponse;
import com.karthik.commandcentre.review.dto.CreateWeeklyReviewRequest;
import com.karthik.commandcentre.review.dto.UpdateWeeklyReviewRequest;
import com.karthik.commandcentre.review.dto.WeeklyAggregatedSummaryDto;
import com.karthik.commandcentre.review.dto.WeeklyReviewDto;
import com.karthik.commandcentre.review.service.WeeklyReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class WeeklyReviewController {

    private final WeeklyReviewService weeklyReviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WeeklyReviewDto>>> getAllReviews() {
        List<WeeklyReviewDto> reviews = weeklyReviewService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.success("Weekly reviews retrieved successfully.", reviews));
    }

    @GetMapping("/auto-aggregate")
    public ResponseEntity<ApiResponse<WeeklyAggregatedSummaryDto>> autoAggregate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        if (weekStart == null) {
            weekStart = LocalDate.now().minusDays(6);
        }
        WeeklyAggregatedSummaryDto summary = weeklyReviewService.autoAggregateWeeklyProgress(weekStart);
        return ResponseEntity.ok(ApiResponse.success("Weekly activity aggregated successfully.", summary));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WeeklyReviewDto>> getReviewById(@PathVariable Long id) {
        WeeklyReviewDto review = weeklyReviewService.getReviewById(id);
        return ResponseEntity.ok(ApiResponse.success("Weekly review retrieved successfully.", review));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WeeklyReviewDto>> createReview(
            @Valid @RequestBody CreateWeeklyReviewRequest request) {
        WeeklyReviewDto review = weeklyReviewService.createReview(request);
        return ResponseEntity.ok(ApiResponse.success("Weekly review saved successfully.", review));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WeeklyReviewDto>> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWeeklyReviewRequest request) {
        WeeklyReviewDto updated = weeklyReviewService.updateReview(id, request);
        return ResponseEntity.ok(ApiResponse.success("Weekly review updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        weeklyReviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Weekly review deleted successfully."));
    }
}
