package com.karthik.commandcentre.dsa.entity;

import com.karthik.commandcentre.auth.entity.Owner;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dsa_problem", indexes = {
    @Index(name = "idx_dsa_owner_topic_diff", columnList = "owner_id,topic,difficulty")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DsaProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @Column(nullable = false)
    private String title;

    private String platform;

    private String topic;

    @Column(nullable = false)
    @Builder.Default
    private String difficulty = "MEDIUM";

    @Column(name = "problem_url")
    private String problemUrl;

    @Column(name = "date_solved")
    private LocalDate dateSolved;

    @Column(name = "solution_notes", columnDefinition = "TEXT")
    private String solutionNotes;

    @Column(name = "time_complexity")
    private String timeComplexity;

    @Column(name = "space_complexity")
    private String spaceComplexity;

    @Column(nullable = false)
    @Builder.Default
    private String status = "UNSOLVED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
