package com.karthik.commandcentre.review.entity;

import com.karthik.commandcentre.auth.entity.Owner;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_review", indexes = {
    @Index(name = "idx_review_owner_week", columnList = "owner_id,weekStartDate")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WeeklyReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(name = "concepts_learned", columnDefinition = "TEXT")
    private String conceptsLearned;

    @Column(name = "programs_completed", columnDefinition = "TEXT")
    private String programsCompleted;

    @Column(name = "bugs_solved", columnDefinition = "TEXT")
    private String bugsSolved;

    @Column(name = "unclear_topics", columnDefinition = "TEXT")
    private String unclearTopics;

    @Column(name = "github_commits", columnDefinition = "TEXT")
    private String githubCommits;

    @Column(name = "dsa_problems_solved")
    @Builder.Default
    private Integer dsaProblemsSolved = 0;

    @Column(name = "next_week_goal", columnDefinition = "TEXT")
    private String nextWeekGoal;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
