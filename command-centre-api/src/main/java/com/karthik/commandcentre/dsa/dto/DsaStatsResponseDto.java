package com.karthik.commandcentre.dsa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DsaStatsResponseDto {
    private long total;
    private long solved;
    private long unsolved;
    private long easySolved;
    private long mediumSolved;
    private long hardSolved;
    private Map<String, Long> topicBreakdown;
    private Map<String, Long> platformBreakdown;
}
