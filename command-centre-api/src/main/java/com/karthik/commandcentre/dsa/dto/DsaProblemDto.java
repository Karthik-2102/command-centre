package com.karthik.commandcentre.dsa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DsaProblemDto {
    private Long id;
    private String title;
    private String platform;        // LeetCode, HackerRank, GeeksforGeeks, CodeStudio, etc.
    private String topic;           // Arrays, Strings, Two Pointers, Trees, DP, etc.
    private String difficulty;      // EASY, MEDIUM, HARD
    private String problemUrl;
    private LocalDate dateSolved;
    private String solutionNotes;
    private String timeComplexity;  // e.g. O(n)
    private String spaceComplexity; // e.g. O(1)
    private String status;          // SOLVED, UNSOLVED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
