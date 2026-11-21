package com.karthik.commandcentre.analytics.service;

import com.karthik.commandcentre.analytics.dto.AnalyticsSummaryDto;
import com.karthik.commandcentre.analytics.dto.OverviewStatsDto;
import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.OwnerRepository;
import com.karthik.commandcentre.calendar.entity.StudySession;
import com.karthik.commandcentre.calendar.repository.StudySessionRepository;
import com.karthik.commandcentre.common.exception.ApiException;
import com.karthik.commandcentre.dsa.entity.DsaProblem;
import com.karthik.commandcentre.dsa.repository.DsaProblemRepository;
import com.karthik.commandcentre.project.repository.ProjectRepository;
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
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final LearningStageRepository stageRepository;
    private final LearningTopicRepository topicRepository;
    private final TaskRepository taskRepository;
    private final DsaProblemRepository dsaProblemRepository;
    private final ProjectRepository projectRepository;
    private final StudySessionRepository studySessionRepository;
    private final OwnerRepository ownerRepository;

    @Value("${app.owner.email:karthikvikash02@gmail.com}")
    private String defaultOwnerEmail;

    private Owner getOwner() {
        return ownerRepository.findByEmail(defaultOwnerEmail)
                .orElseGet(() -> ownerRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> ApiException.notFound("Owner not found")));
    }

    @Transactional(readOnly = true)
    public OverviewStatsDto getOverviewStats() {
        Owner owner = getOwner();
        Long ownerId = owner.getId();
        LocalDate today = LocalDate.now();

        // 1. Topics aggregation
        List<LearningTopic> allTopics = topicRepository.findAll();
        long totalTopics = allTopics.size();
        long completedTopics = allTopics.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long inProgressTopics = allTopics.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count();
        long pendingTopics = totalTopics - completedTopics;

        int overallPercentage = totalTopics > 0 ? (int) Math.round(((double) completedTopics / totalTopics) * 100) : 0;

        // 2. Stages
        List<LearningStage> stages = stageRepository.findAllByOrderByDisplayOrderAsc();
        LearningStage activeStage = stages.stream()
                .filter(s -> !"COMPLETED".equalsIgnoreCase(s.getStatus()))
                .findFirst()
                .orElse(stages.isEmpty() ? null : stages.get(0));

        String currentStageTitle = activeStage != null ? activeStage.getTitle() : "Java Fundamentals";
        int currentStageNumber = activeStage != null ? activeStage.getStageNumber() : 1;
        String currentMonth = activeStage != null ? activeStage.getMonthRange() : "Month 1";

        // 3. Study Hours
        BigDecimal totalHours = studySessionRepository.getTotalHoursByOwnerId(ownerId);
        if (totalHours == null) totalHours = BigDecimal.ZERO;

        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        BigDecimal weekHours = studySessionRepository.getHoursBetween(ownerId, weekStart, weekEnd);
        if (weekHours == null) weekHours = BigDecimal.ZERO;

        BigDecimal todayHours = studySessionRepository.getHoursBetween(ownerId, today, today);
        if (todayHours == null) todayHours = BigDecimal.ZERO;

        // 4. DSA problems solved
        long dsaSolved = dsaProblemRepository.countByOwnerIdAndStatus(ownerId, "SOLVED");

        // 5. Active projects
        long activeProjects = projectRepository.countByOwnerIdAndStatus(ownerId, "IN_PROGRESS");

        // 6. Streak calculation (consecutive days with study sessions)
        int streak = calculateStreak(ownerId, today);

        // 7. Today's priorities (high priority tasks + tasks due today/uncompleted)
        List<Task> todayTasks = taskRepository.findByOwnerIdAndDueDate(ownerId, today);
        List<OverviewStatsDto.TodayPriorityDto> priorities = todayTasks.stream()
                .limit(5)
                .map(t -> OverviewStatsDto.TodayPriorityDto.builder()
                        .id(t.getId())
                        .title(t.getTitle())
                        .priority(t.getPriority())
                        .category(t.getCategory())
                        .status(t.getStatus())
                        .dueDate(t.getDueDate() != null ? t.getDueDate().toString() : null)
                        .build())
                .collect(Collectors.toList());

        // 8. Weekly Study Hours Chart (Mon - Sun)
        List<StudySession> weeklySessions = studySessionRepository
                .findByOwnerIdAndSessionDateBetweenOrderBySessionDateAsc(ownerId, weekStart, weekEnd);
        Map<LocalDate, BigDecimal> hoursByDate = weeklySessions.stream()
                .collect(Collectors.groupingBy(
                        StudySession::getSessionDate,
                        Collectors.reducing(BigDecimal.ZERO, StudySession::getHours, BigDecimal::add)
                ));

        List<OverviewStatsDto.WeeklyStudyHourPoint> weeklyChart = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = weekStart.plusDays(i);
            String dayName = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            BigDecimal hrs = hoursByDate.getOrDefault(d, BigDecimal.ZERO);
            weeklyChart.add(OverviewStatsDto.WeeklyStudyHourPoint.builder()
                    .day(dayName)
                    .date(d.toString())
                    .hours(hrs)
                    .targetHours(new BigDecimal("3.0"))
                    .build());
        }

        // 9. Stage Progress Points
        List<OverviewStatsDto.StageProgressPoint> stageChart = stages.stream()
                .map(s -> {
                    List<LearningTopic> sTopics = s.getTopics();
                    int sTotal = sTopics != null ? sTopics.size() : 0;
                    long sDone = sTopics != null ? sTopics.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count() : 0;
                    int pct = sTotal > 0 ? (int) Math.round(((double) sDone / sTotal) * 100) : 0;
                    return OverviewStatsDto.StageProgressPoint.builder()
                            .stage("Stage " + s.getStageNumber())
                            .title(s.getTitle())
                            .totalTopics(sTotal)
                            .completedTopics((int) sDone)
                            .percentage(pct)
                            .build();
                })
                .collect(Collectors.toList());

        return OverviewStatsDto.builder()
                .overallProgressPercentage(overallPercentage)
                .currentStageTitle(currentStageTitle)
                .currentStageNumber(currentStageNumber)
                .currentMonth(currentMonth)
                .totalStudyHours(totalHours)
                .todayStudyHours(todayHours)
                .weeklyStudyHours(weekHours)
                .completedTopics(completedTopics)
                .inProgressTopics(inProgressTopics)
                .pendingTopics(pendingTopics)
                .totalTopics(totalTopics)
                .dsaProblemsSolved(dsaSolved)
                .activeProjects(activeProjects)
                .currentStreakDays(streak)
                .todayPriorities(priorities)
                .weeklyStudyChart(weeklyChart)
                .stageProgressChart(stageChart)
                .build();
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryDto getAnalyticsSummary() {
        Owner owner = getOwner();
        Long ownerId = owner.getId();
        LocalDate today = LocalDate.now();

        // 1. Study Hours
        BigDecimal totalHours = studySessionRepository.getTotalHoursByOwnerId(ownerId);
        if (totalHours == null) totalHours = BigDecimal.ZERO;

        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.with(TemporalAdjusters.lastDayOfMonth());
        BigDecimal thisMonthHours = studySessionRepository.getHoursBetween(ownerId, monthStart, monthEnd);
        if (thisMonthHours == null) thisMonthHours = BigDecimal.ZERO;

        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        BigDecimal thisWeekHours = studySessionRepository.getHoursBetween(ownerId, weekStart, weekEnd);
        if (thisWeekHours == null) thisWeekHours = BigDecimal.ZERO;

        BigDecimal dailyAvg = totalHours.compareTo(BigDecimal.ZERO) > 0
                ? totalHours.divide(new BigDecimal("30"), 1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 2. Topics
        List<LearningTopic> allTopics = topicRepository.findAll();
        long totalTopics = allTopics.size();
        long completedTopics = allTopics.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long inProgressTopics = allTopics.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count();
        long notStartedTopics = totalTopics - completedTopics - inProgressTopics;
        int roadmapPercentage = totalTopics > 0 ? (int) Math.round(((double) completedTopics / totalTopics) * 100) : 0;

        // 3. Tasks
        long pendingTasks = taskRepository.countByOwnerIdAndStatus(ownerId, "PENDING");
        long completedTasks = taskRepository.countByOwnerIdAndStatus(ownerId, "COMPLETED");
        long totalTasks = pendingTasks + completedTasks;
        int taskRate = totalTasks > 0 ? (int) Math.round(((double) completedTasks / totalTasks) * 100) : 0;

        // 4. DSA
        long totalDsa = dsaProblemRepository.countByOwnerIdAndStatus(ownerId, "SOLVED");
        long easyDsa = dsaProblemRepository.countByOwnerIdAndDifficulty(ownerId, "EASY");
        long mediumDsa = dsaProblemRepository.countByOwnerIdAndDifficulty(ownerId, "MEDIUM");
        long hardDsa = dsaProblemRepository.countByOwnerIdAndDifficulty(ownerId, "HARD");

        List<DsaProblem> allDsa = dsaProblemRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
        Map<String, Long> topicDistribution = allDsa.stream()
                .filter(d -> d.getTopic() != null && !d.getTopic().isBlank())
                .collect(Collectors.groupingBy(DsaProblem::getTopic, Collectors.counting()));

        List<AnalyticsSummaryDto.DsaTopicBreakdown> dsaTopicList = topicDistribution.entrySet().stream()
                .map(e -> new AnalyticsSummaryDto.DsaTopicBreakdown(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .limit(8)
                .collect(Collectors.toList());

        List<AnalyticsSummaryDto.DsaDifficultyPoint> dsaDiffChart = List.of(
                new AnalyticsSummaryDto.DsaDifficultyPoint("Easy", easyDsa, "#10b981"),
                new AnalyticsSummaryDto.DsaDifficultyPoint("Medium", mediumDsa, "#eab308"),
                new AnalyticsSummaryDto.DsaDifficultyPoint("Hard", hardDsa, "#ef4444")
        );

        // 5. Projects
        long inProgressProjects = projectRepository.countByOwnerIdAndStatus(ownerId, "IN_PROGRESS");
        long completedProjects = projectRepository.countByOwnerIdAndStatus(ownerId, "COMPLETED");
        long plannedProjects = projectRepository.countByOwnerIdAndStatus(ownerId, "PLANNED");
        long totalProjects = inProgressProjects + completedProjects + plannedProjects;

        // 6. Monthly trend mock/aggregate
        List<AnalyticsSummaryDto.MonthlyStudyTrendPoint> trend = List.of(
                new AnalyticsSummaryDto.MonthlyStudyTrendPoint("Month 1", thisMonthHours)
        );

        return AnalyticsSummaryDto.builder()
                .dailyAverageHours(dailyAvg)
                .thisWeekHours(thisWeekHours)
                .thisMonthHours(thisMonthHours)
                .allTimeHours(totalHours)
                .roadmapCompletionPercentage(roadmapPercentage)
                .totalTopics(totalTopics)
                .completedTopics(completedTopics)
                .inProgressTopics(inProgressTopics)
                .notStartedTopics(notStartedTopics)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .taskCompletionRate(taskRate)
                .totalDsaSolved(totalDsa)
                .easyDsaSolved(easyDsa)
                .mediumDsaSolved(mediumDsa)
                .hardDsaSolved(hardDsa)
                .dsaTopicDistribution(dsaTopicList)
                .dsaDifficultyChart(dsaDiffChart)
                .totalProjects(totalProjects)
                .inProgressProjects(inProgressProjects)
                .completedProjects(completedProjects)
                .monthlyStudyTrend(trend)
                .build();
    }

    private int calculateStreak(Long ownerId, LocalDate today) {
        int streak = 0;
        LocalDate checkDate = today;

        for (int i = 0; i < 60; i++) {
            BigDecimal hours = studySessionRepository.getHoursBetween(ownerId, checkDate, checkDate);
            if (hours != null && hours.compareTo(BigDecimal.ZERO) > 0) {
                streak++;
                checkDate = checkDate.minusDays(1);
            } else if (i == 0) {
                // Today might not be logged yet, check yesterday
                checkDate = checkDate.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }
}
