package com.karthik.commandcentre.dsa.service;

import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.OwnerRepository;
import com.karthik.commandcentre.common.exception.ApiException;
import com.karthik.commandcentre.dsa.dto.CreateDsaProblemRequest;
import com.karthik.commandcentre.dsa.dto.DsaProblemDto;
import com.karthik.commandcentre.dsa.dto.DsaStatsResponseDto;
import com.karthik.commandcentre.dsa.dto.UpdateDsaProblemRequest;
import com.karthik.commandcentre.dsa.entity.DsaProblem;
import com.karthik.commandcentre.dsa.repository.DsaProblemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DsaProblemService {

    private final DsaProblemRepository dsaProblemRepository;
    private final OwnerRepository ownerRepository;

    @Value("${app.owner.email:karthikvikash02@gmail.com}")
    private String defaultOwnerEmail;

    private Owner getOwner() {
        return ownerRepository.findByEmail(defaultOwnerEmail)
                .orElseGet(() -> ownerRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> ApiException.notFound("Owner profile not found.")));
    }

    @Transactional(readOnly = true)
    public List<DsaProblemDto> getProblems(String difficulty, String topic, String platform, String status, String query) {
        Owner owner = getOwner();
        Long ownerId = owner.getId();

        List<DsaProblem> problems = dsaProblemRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);

        return problems.stream()
                .filter(p -> difficulty == null || difficulty.isBlank() || "ALL".equalsIgnoreCase(difficulty) || p.getDifficulty().equalsIgnoreCase(difficulty))
                .filter(p -> topic == null || topic.isBlank() || "ALL".equalsIgnoreCase(topic) || (p.getTopic() != null && p.getTopic().equalsIgnoreCase(topic)))
                .filter(p -> platform == null || platform.isBlank() || "ALL".equalsIgnoreCase(platform) || (p.getPlatform() != null && p.getPlatform().equalsIgnoreCase(platform)))
                .filter(p -> status == null || status.isBlank() || "ALL".equalsIgnoreCase(status) || p.getStatus().equalsIgnoreCase(status))
                .filter(p -> {
                    if (query == null || query.isBlank()) return true;
                    String q = query.toLowerCase();
                    boolean inTitle = p.getTitle() != null && p.getTitle().toLowerCase().contains(q);
                    boolean inNotes = p.getSolutionNotes() != null && p.getSolutionNotes().toLowerCase().contains(q);
                    return inTitle || inNotes;
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DsaProblemDto getProblemById(Long id) {
        DsaProblem problem = dsaProblemRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("DSA Problem not found with ID: " + id));
        return mapToDto(problem);
    }

    @Transactional
    public DsaProblemDto createProblem(CreateDsaProblemRequest request) {
        Owner owner = getOwner();

        String status = request.getStatus() != null && !request.getStatus().isBlank()
                ? request.getStatus().toUpperCase() : "SOLVED";

        LocalDate dateSolved = request.getDateSolved();
        if ("SOLVED".equals(status) && dateSolved == null) {
            dateSolved = LocalDate.now();
        }

        DsaProblem problem = DsaProblem.builder()
                .owner(owner)
                .title(request.getTitle())
                .platform(request.getPlatform() != null ? request.getPlatform() : "LeetCode")
                .topic(request.getTopic() != null ? request.getTopic() : "Arrays")
                .difficulty(request.getDifficulty().toUpperCase())
                .problemUrl(request.getProblemUrl())
                .dateSolved(dateSolved)
                .solutionNotes(request.getSolutionNotes())
                .timeComplexity(request.getTimeComplexity())
                .spaceComplexity(request.getSpaceComplexity())
                .status(status)
                .build();

        dsaProblemRepository.save(problem);
        return mapToDto(problem);
    }

    @Transactional
    public DsaProblemDto updateProblem(Long id, UpdateDsaProblemRequest request) {
        DsaProblem problem = dsaProblemRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("DSA Problem not found with ID: " + id));

        String newStatus = request.getStatus() != null ? request.getStatus().toUpperCase() : problem.getStatus();

        problem.setTitle(request.getTitle());
        problem.setPlatform(request.getPlatform());
        problem.setTopic(request.getTopic());
        problem.setDifficulty(request.getDifficulty().toUpperCase());
        problem.setProblemUrl(request.getProblemUrl());
        problem.setSolutionNotes(request.getSolutionNotes());
        problem.setTimeComplexity(request.getTimeComplexity());
        problem.setSpaceComplexity(request.getSpaceComplexity());
        problem.setStatus(newStatus);

        if ("SOLVED".equals(newStatus) && problem.getDateSolved() == null) {
            problem.setDateSolved(request.getDateSolved() != null ? request.getDateSolved() : LocalDate.now());
        } else if ("UNSOLVED".equals(newStatus)) {
            problem.setDateSolved(null);
        } else if (request.getDateSolved() != null) {
            problem.setDateSolved(request.getDateSolved());
        }

        dsaProblemRepository.save(problem);
        return mapToDto(problem);
    }

    @Transactional
    public DsaProblemDto toggleProblemStatus(Long id) {
        DsaProblem problem = dsaProblemRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("DSA Problem not found with ID: " + id));

        if ("SOLVED".equalsIgnoreCase(problem.getStatus())) {
            problem.setStatus("UNSOLVED");
            problem.setDateSolved(null);
        } else {
            problem.setStatus("SOLVED");
            problem.setDateSolved(LocalDate.now());
        }

        dsaProblemRepository.save(problem);
        return mapToDto(problem);
    }

    @Transactional
    public void deleteProblem(Long id) {
        if (!dsaProblemRepository.existsById(id)) {
            throw ApiException.notFound("DSA Problem not found with ID: " + id);
        }
        dsaProblemRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public DsaStatsResponseDto getDsaStats() {
        Owner owner = getOwner();
        Long ownerId = owner.getId();

        List<DsaProblem> allProblems = dsaProblemRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);

        long total = allProblems.size();
        long solved = allProblems.stream().filter(p -> "SOLVED".equalsIgnoreCase(p.getStatus())).count();
        long unsolved = total - solved;

        long easySolved = allProblems.stream().filter(p -> "SOLVED".equalsIgnoreCase(p.getStatus()) && "EASY".equalsIgnoreCase(p.getDifficulty())).count();
        long mediumSolved = allProblems.stream().filter(p -> "SOLVED".equalsIgnoreCase(p.getStatus()) && "MEDIUM".equalsIgnoreCase(p.getDifficulty())).count();
        long hardSolved = allProblems.stream().filter(p -> "SOLVED".equalsIgnoreCase(p.getStatus()) && "HARD".equalsIgnoreCase(p.getDifficulty())).count();

        Map<String, Long> topicBreakdown = allProblems.stream()
                .filter(p -> "SOLVED".equalsIgnoreCase(p.getStatus()) && p.getTopic() != null && !p.getTopic().isBlank())
                .collect(Collectors.groupingBy(DsaProblem::getTopic, Collectors.counting()));

        Map<String, Long> platformBreakdown = allProblems.stream()
                .filter(p -> p.getPlatform() != null && !p.getPlatform().isBlank())
                .collect(Collectors.groupingBy(DsaProblem::getPlatform, Collectors.counting()));

        return DsaStatsResponseDto.builder()
                .total(total)
                .solved(solved)
                .unsolved(unsolved)
                .easySolved(easySolved)
                .mediumSolved(mediumSolved)
                .hardSolved(hardSolved)
                .topicBreakdown(topicBreakdown)
                .platformBreakdown(platformBreakdown)
                .build();
    }

    private DsaProblemDto mapToDto(DsaProblem p) {
        return DsaProblemDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .platform(p.getPlatform())
                .topic(p.getTopic())
                .difficulty(p.getDifficulty())
                .problemUrl(p.getProblemUrl())
                .dateSolved(p.getDateSolved())
                .solutionNotes(p.getSolutionNotes())
                .timeComplexity(p.getTimeComplexity())
                .spaceComplexity(p.getSpaceComplexity())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
