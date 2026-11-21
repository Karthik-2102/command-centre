package com.karthik.commandcentre.review.service;

import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.OwnerRepository;
import com.karthik.commandcentre.calendar.entity.StudySession;
import com.karthik.commandcentre.calendar.repository.StudySessionRepository;
import com.karthik.commandcentre.common.exception.ApiException;
import com.karthik.commandcentre.dsa.entity.DsaProblem;
import com.karthik.commandcentre.dsa.repository.DsaProblemRepository;
import com.karthik.commandcentre.review.dto.CreateWeeklyReviewRequest;
import com.karthik.commandcentre.review.dto.UpdateWeeklyReviewRequest;
import com.karthik.commandcentre.review.dto.WeeklyAggregatedSummaryDto;
import com.karthik.commandcentre.review.dto.WeeklyReviewDto;
import com.karthik.commandcentre.review.entity.WeeklyReview;
import com.karthik.commandcentre.review.repository.WeeklyReviewRepository;
import com.karthik.commandcentre.roadmap.entity.LearningStage;
import com.karthik.commandcentre.roadmap.entity.LearningTopic;
import com.karthik.commandcentre.roadmap.repository.LearningStageRepository;
import com.karthik.commandcentre.roadmap.repository.LearningTopicRepository;
import com.karthik.commandcentre.task.entity.Task;
import com.karthik.commandcentre.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeeklyReviewService {

    private final WeeklyReviewRepository weeklyReviewRepository;
    private final OwnerRepository ownerRepository;
    private final StudySessionRepository studySessionRepository;
    private final DsaProblemRepository dsaProblemRepository;
    private final TaskRepository taskRepository;
    private final LearningTopicRepository learningTopicRepository;
    private final LearningStageRepository learningStageRepository;

    @Value("${app.owner.email:karthikvikash02@gmail.com}")
    private String defaultOwnerEmail;

    private Owner getOwner() {
        return ownerRepository.findByEmail(defaultOwnerEmail)
                .orElseGet(() -> ownerRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> ApiException.notFound("Owner profile not found.")));
    }

    @Transactional(readOnly = true)
    public WeeklyAggregatedSummaryDto autoAggregateWeeklyProgress(LocalDate weekStart) {
        Owner owner = getOwner();
        LocalDate weekEnd = weekStart.plusDays(6);

        // 1. Study Sessions in the week
        List<StudySession> sessions = studySessionRepository
                .findByOwnerIdAndSessionDateBetweenOrderBySessionDateAsc(owner.getId(), weekStart, weekEnd);

        BigDecimal totalHours = sessions.stream()
                .map(StudySession::getHours)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Set<LocalDate> activeDays = new HashSet<>();
        List<String> topicsCovered = new ArrayList<>();
        for (StudySession s : sessions) {
            if (s.getSessionDate() != null) activeDays.add(s.getSessionDate());
            if (s.getTopic() != null && !topicsCovered.contains(s.getTopic())) {
                topicsCovered.add(s.getTopic());
            }
        }

        // 2. DSA Problems solved in the week
        List<DsaProblem> dsaProblems = dsaProblemRepository
                .findByOwnerIdAndStatusAndDateSolvedBetween(owner.getId(), "SOLVED", weekStart, weekEnd);

        List<String> problemsSolvedNames = new ArrayList<>();
        for (DsaProblem p : dsaProblems) {
            if (p.getDateSolved() != null) activeDays.add(p.getDateSolved());
            problemsSolvedNames.add(p.getTitle() + " (" + p.getDifficulty() + " - " + p.getPlatform() + ")");
        }

        // 3. Completed Tasks in the week
        List<Task> completedTasks = taskRepository
                .findByOwnerIdAndStatusAndDueDateBetween(owner.getId(), "COMPLETED", weekStart, weekEnd);

        // 4. Completed Learning Topics
        List<LearningTopic> completedTopics = learningTopicRepository
                .findByStatusAndCompletionDateBetween("COMPLETED", weekStart, weekEnd);

        for (LearningTopic t : completedTopics) {
            if (t.getCompletionDate() != null) activeDays.add(t.getCompletionDate());
            if (!topicsCovered.contains(t.getTitle())) {
                topicsCovered.add(t.getTitle());
            }
        }

        // 5. Generate formatted markdown strings
        StringBuilder conceptsBuilder = new StringBuilder();
        if (!topicsCovered.isEmpty()) {
            topicsCovered.forEach(top -> conceptsBuilder.append("• ").append(top).append("\n"));
        } else {
            conceptsBuilder.append("• Java 21 Syntax, OOP Foundations & Collections\n• Data Structures: Arrays & Hash Maps");
        }

        StringBuilder programsBuilder = new StringBuilder();
        if (!problemsSolvedNames.isEmpty()) {
            programsBuilder.append("DSA Problems Cleared:\n");
            problemsSolvedNames.forEach(prob -> programsBuilder.append("• ").append(prob).append("\n"));
        }
        if (!completedTasks.isEmpty()) {
            programsBuilder.append("\nMilestone Tasks Done:\n");
            completedTasks.forEach(task -> programsBuilder.append("• ").append(task.getTitle()).append("\n"));
        }
        if (programsBuilder.length() == 0) {
            programsBuilder.append("• Built Java console programs and solved initial leetcode practice patterns.");
        }

        // 6. Suggest next week goal from upcoming roadmap topics
        StringBuilder nextGoalBuilder = new StringBuilder();
        List<LearningStage> stages = learningStageRepository.findAllByOrderByDisplayOrderAsc();
        LearningStage activeStage = stages.stream()
                .filter(s -> "IN_PROGRESS".equalsIgnoreCase(s.getStatus()))
                .findFirst()
                .orElse(stages.isEmpty() ? null : stages.get(0));

        if (activeStage != null) {
            List<LearningTopic> upcomingTopics = learningTopicRepository
                    .findByStageIdOrderByDisplayOrderAsc(activeStage.getId()).stream()
                    .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()))
                    .limit(3)
                    .toList();

            if (!upcomingTopics.isEmpty()) {
                nextGoalBuilder.append("Next Sprint Target (").append(activeStage.getTitle()).append("):\n");
                upcomingTopics.forEach(t -> nextGoalBuilder.append("• Master ").append(t.getTitle()).append("\n"));
                nextGoalBuilder.append("• Solve 15+ DSA problems and maintain 3 hours daily focused sprint.");
            } else {
                nextGoalBuilder.append("• Advance to next learning stage and build milestone backend project.");
            }
        } else {
            nextGoalBuilder.append("• Advance through Stage 1 topics and maintain 21-day consistency streak.");
        }

        return WeeklyAggregatedSummaryDto.builder()
                .weekStartDate(weekStart)
                .weekEndDate(weekEnd)
                .totalStudyHours(totalHours)
                .dsaProblemsSolved(dsaProblems.size())
                .tasksCompleted(completedTasks.size())
                .topicsCompleted(completedTopics.size())
                .activeDaysCount(activeDays.size())
                .conceptsLearned(conceptsBuilder.toString().trim())
                .programsCompleted(programsBuilder.toString().trim())
                .bugsSolved("Resolved null pointer edge cases, fixed off-by-one loops, and tuned memory limits.")
                .nextWeekGoal(nextGoalBuilder.toString().trim())
                .topicsCovered(topicsCovered)
                .problemsSolved(problemsSolvedNames)
                .build();
    }

    @Transactional(readOnly = true)
    public List<WeeklyReviewDto> getAllReviews() {
        Owner owner = getOwner();
        List<WeeklyReview> reviews = weeklyReviewRepository.findByOwnerIdOrderByWeekStartDateDesc(owner.getId());
        return reviews.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WeeklyReviewDto getReviewById(Long id) {
        WeeklyReview review = weeklyReviewRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Weekly Review not found with ID: " + id));
        return mapToDto(review);
    }

    @Transactional
    public WeeklyReviewDto createReview(CreateWeeklyReviewRequest request) {
        Owner owner = getOwner();

        WeeklyReview review = WeeklyReview.builder()
                .owner(owner)
                .weekStartDate(request.getWeekStartDate())
                .conceptsLearned(request.getConceptsLearned())
                .programsCompleted(request.getProgramsCompleted())
                .bugsSolved(request.getBugsSolved())
                .unclearTopics(request.getUnclearTopics())
                .githubCommits(request.getGithubCommits())
                .dsaProblemsSolved(request.getDsaProblemsSolved() != null ? request.getDsaProblemsSolved() : 0)
                .nextWeekGoal(request.getNextWeekGoal())
                .build();

        weeklyReviewRepository.save(review);
        return mapToDto(review);
    }

    @Transactional
    public WeeklyReviewDto updateReview(Long id, UpdateWeeklyReviewRequest request) {
        WeeklyReview review = weeklyReviewRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Weekly Review not found with ID: " + id));

        review.setWeekStartDate(request.getWeekStartDate());
        review.setConceptsLearned(request.getConceptsLearned());
        review.setProgramsCompleted(request.getProgramsCompleted());
        review.setBugsSolved(request.getBugsSolved());
        review.setUnclearTopics(request.getUnclearTopics());
        review.setGithubCommits(request.getGithubCommits());
        review.setDsaProblemsSolved(request.getDsaProblemsSolved());
        review.setNextWeekGoal(request.getNextWeekGoal());

        weeklyReviewRepository.save(review);
        return mapToDto(review);
    }

    @Transactional
    public void deleteReview(Long id) {
        if (!weeklyReviewRepository.existsById(id)) {
            throw ApiException.notFound("Weekly Review not found with ID: " + id);
        }
        weeklyReviewRepository.deleteById(id);
    }

    private WeeklyReviewDto mapToDto(WeeklyReview r) {
        return WeeklyReviewDto.builder()
                .id(r.getId())
                .weekStartDate(r.getWeekStartDate())
                .conceptsLearned(r.getConceptsLearned())
                .programsCompleted(r.getProgramsCompleted())
                .bugsSolved(r.getBugsSolved())
                .unclearTopics(r.getUnclearTopics())
                .githubCommits(r.getGithubCommits())
                .dsaProblemsSolved(r.getDsaProblemsSolved())
                .nextWeekGoal(r.getNextWeekGoal())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
