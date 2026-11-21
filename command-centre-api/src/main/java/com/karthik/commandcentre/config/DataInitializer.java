package com.karthik.commandcentre.config;

import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.OwnerRepository;
import com.karthik.commandcentre.calendar.entity.StudySession;
import com.karthik.commandcentre.calendar.repository.StudySessionRepository;
import com.karthik.commandcentre.dsa.entity.DsaProblem;
import com.karthik.commandcentre.dsa.repository.DsaProblemRepository;
import com.karthik.commandcentre.project.entity.Project;
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
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final OwnerRepository ownerRepository;
    private final LearningStageRepository stageRepository;
    private final LearningTopicRepository topicRepository;
    private final TaskRepository taskRepository;
    private final DsaProblemRepository dsaProblemRepository;
    private final ProjectRepository projectRepository;
    private final StudySessionRepository studySessionRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.owner.email:karthikvikash02@gmail.com}")
    private String ownerEmail;

    @Value("${app.owner.name:Karthik}")
    private String ownerName;

    @Value("${app.owner.password:CommandCentre@2024}")
    private String ownerPassword;

    @Override
    public void run(String... args) {
        Owner owner = seedOwner();
        seedRoadmap();
        seedTasks(owner);
        seedDsa(owner);
        seedProjects(owner);
        seedStudySessions(owner);
    }

    private Owner seedOwner() {
        String email = ownerEmail.trim().toLowerCase();
        java.util.Optional<Owner> existing = ownerRepository.findByEmail(email);
        if (existing.isPresent()) {
            Owner o = existing.get();
            if (o.getPasswordHash() == null && ownerPassword != null && !ownerPassword.isBlank()) {
                o.setPasswordHash(passwordEncoder.encode(ownerPassword));
                ownerRepository.save(o);
            }
            log.info("Owner account '{}' verified and active.", email);
            return o;
        }

        // If an owner exists with another email, update to the configured real email
        java.util.List<Owner> all = ownerRepository.findAll();
        if (!all.isEmpty()) {
            Owner o = all.get(0);
            log.info("Migrating existing owner from '{}' to real email '{}'", o.getEmail(), email);
            o.setEmail(email);
            o.setName(ownerName);
            if (o.getPasswordHash() == null && ownerPassword != null && !ownerPassword.isBlank()) {
                o.setPasswordHash(passwordEncoder.encode(ownerPassword));
            }
            return ownerRepository.save(o);
        }

        log.info("Seeding predefined owner account: {}", email);
        Owner newOwner = Owner.builder()
                .email(email)
                .name(ownerName)
                .passwordHash(passwordEncoder.encode(ownerPassword != null && !ownerPassword.isBlank() ? ownerPassword : "CommandCentre@2024"))
                .build();
        Owner saved = ownerRepository.save(newOwner);
        log.info("Owner account created successfully for: {}", email);
        return saved;
    }

    private void seedTasks(Owner owner) {
        if (taskRepository.count() > 0) return;
        log.info("Seeding initial starter tasks for Karthik...");
        taskRepository.save(Task.builder()
                .owner(owner)
                .title("Setup PostgreSQL Local Database & pgAdmin")
                .description("Configure local postgres instance, database command_centre, and verify migrations.")
                .priority("HIGH")
                .category("Database")
                .status("COMPLETED")
                .dueDate(LocalDate.now().minusDays(2))
                .completedAt(LocalDateTime.now().minusDays(2))
                .build());

        taskRepository.save(Task.builder()
                .owner(owner)
                .title("Solve 5 LeetCode Two Sum & Hashing problems")
                .description("Practice hash map lookups, edge cases, and analyze O(n) time complexity.")
                .priority("HIGH")
                .category("DSA")
                .status("COMPLETED")
                .dueDate(LocalDate.now().minusDays(1))
                .completedAt(LocalDateTime.now().minusDays(1))
                .build());

        taskRepository.save(Task.builder()
                .owner(owner)
                .title("Build REST API Controllers & Exception Handlers in Spring Boot")
                .description("Create @RestController, @RestControllerAdvice, validation with Jakarta, and ApiResponse wrapper.")
                .priority("HIGH")
                .category("Spring Boot")
                .status("PENDING")
                .dueDate(LocalDate.now().plusDays(2))
                .build());

        taskRepository.save(Task.builder()
                .owner(owner)
                .title("Configure Docker Compose for PostgreSQL & Redis Containerization")
                .description("Create docker-compose.yml with persistent volumes, environment variables, and health checks.")
                .priority("MEDIUM")
                .category("DevOps")
                .status("PENDING")
                .dueDate(LocalDate.now().plusDays(5))
                .build());
    }

    private void seedDsa(Owner owner) {
        if (dsaProblemRepository.count() > 0) return;
        log.info("Seeding starter DSA practice problems for Karthik...");
        dsaProblemRepository.save(DsaProblem.builder()
                .owner(owner)
                .title("Two Sum")
                .platform("LeetCode")
                .topic("Arrays")
                .difficulty("EASY")
                .problemUrl("https://leetcode.com/problems/two-sum/")
                .dateSolved(LocalDate.now().minusDays(4))
                .solutionNotes("One-pass Hash Map storing (target - num[i] -> i). Time: O(n), Space: O(n).")
                .timeComplexity("O(n)")
                .spaceComplexity("O(n)")
                .status("SOLVED")
                .build());

        dsaProblemRepository.save(DsaProblem.builder()
                .owner(owner)
                .title("Valid Anagram")
                .platform("LeetCode")
                .topic("Strings")
                .difficulty("EASY")
                .problemUrl("https://leetcode.com/problems/valid-anagram/")
                .dateSolved(LocalDate.now().minusDays(3))
                .solutionNotes("Fixed-size frequency array of size 26. Increment for s, decrement for t.")
                .timeComplexity("O(n)")
                .spaceComplexity("O(1)")
                .status("SOLVED")
                .build());

        dsaProblemRepository.save(DsaProblem.builder()
                .owner(owner)
                .title("Group Anagrams")
                .platform("LeetCode")
                .topic("Hashing")
                .difficulty("MEDIUM")
                .problemUrl("https://leetcode.com/problems/group-anagrams/")
                .dateSolved(LocalDate.now().minusDays(2))
                .solutionNotes("Use sorted string or 26-char frequency key in HashMap to collect anagram lists.")
                .timeComplexity("O(n * k log k)")
                .spaceComplexity("O(n * k)")
                .status("SOLVED")
                .build());

        dsaProblemRepository.save(DsaProblem.builder()
                .owner(owner)
                .title("Container With Most Water")
                .platform("LeetCode")
                .topic("Two Pointers")
                .difficulty("MEDIUM")
                .problemUrl("https://leetcode.com/problems/container-with-most-water/")
                .dateSolved(LocalDate.now().minusDays(1))
                .solutionNotes("Two pointers from both ends, greedily advance the pointer with smaller height.")
                .timeComplexity("O(n)")
                .spaceComplexity("O(1)")
                .status("SOLVED")
                .build());
    }

    private void seedProjects(Owner owner) {
        if (projectRepository.count() > 0) return;
        log.info("Seeding flagship engineering projects...");
        projectRepository.save(Project.builder()
                .owner(owner)
                .name("Personal Developer Command Centre")
                .description("Private full-stack cockpit tracking 10-month backend engineering journey, DSA SRS practice, daily tasks, study sprints, and career prep.")
                .techStack("Java 21, Spring Boot 3, Spring Security 6, PostgreSQL, React 18, Vite, Tailwind CSS")
                .githubUrl("https://github.com/karthik/command-centre")
                .liveUrl("http://localhost:5173")
                .status("IN_PROGRESS")
                .featuresCompleted("Dual session authentication with 2FA OTP\nLearning roadmap telemetry with 6 stages\nFocus timer with Pomodoro and Stopwatch\nDSA Spaced Repetition engine\nInteractive interview flashcard mode")
                .featuresPending("Docker Compose multi-container deployment\nProduction AWS ECS / Render deployment pipeline\nAutomated weekly report export to PDF")
                .build());
    }

    private void seedStudySessions(Owner owner) {
        if (studySessionRepository.count() > 0) return;
        log.info("Seeding initial study sessions...");
        studySessionRepository.save(StudySession.builder()
                .owner(owner)
                .sessionDate(LocalDate.now().minusDays(2))
                .hours(new BigDecimal("3.0"))
                .topic("Java Fundamentals & OOP Principles")
                .notes("Mastered encapsulation, inheritance hierarchies, abstract classes and interfaces in Java.")
                .build());

        studySessionRepository.save(StudySession.builder()
                .owner(owner)
                .sessionDate(LocalDate.now().minusDays(1))
                .hours(new BigDecimal("3.5"))
                .topic("Spring Boot REST Controllers & JPA")
                .notes("Configured Spring Data JPA repositories, JPQL fetch joins, and DTO request mappings.")
                .build());

        studySessionRepository.save(StudySession.builder()
                .owner(owner)
                .sessionDate(LocalDate.now())
                .hours(new BigDecimal("3.0"))
                .topic("PostgreSQL Indexing & Optimization")
                .notes("Deep dive into B-Tree indexing, composite indexes, and EXPLAIN ANALYZE execution plans.")
                .build());
    }

    private void seedRoadmap() {
        if (stageRepository.count() > 0) {
            log.info("Roadmap stages already initialized ({} found).", stageRepository.count());
            return;
        }

        log.info("Initializing 6 stages and 51 learning topics...");

        // Stage 1
        LearningStage s1 = stageRepository.save(LearningStage.builder()
                .stageNumber(1)
                .title("Java Fundamentals")
                .description("Core Java syntax, operators, control flow, methods, arrays and strings.")
                .monthRange("Month 1")
                .status("IN_PROGRESS")
                .displayOrder(1)
                .build());

        createTopic(s1, "Java Installation & Setup", "COMPLETED", 1);
        createTopic(s1, "Variables & Data Types", "COMPLETED", 2);
        createTopic(s1, "Operators & Expressions", "IN_PROGRESS", 3);
        createTopic(s1, "Input & Output", "NOT_STARTED", 4);
        createTopic(s1, "Conditions & Loops", "NOT_STARTED", 5);
        createTopic(s1, "Methods", "NOT_STARTED", 6);
        createTopic(s1, "Arrays & Strings", "NOT_STARTED", 7);

        // Stage 2
        LearningStage s2 = stageRepository.save(LearningStage.builder()
                .stageNumber(2)
                .title("OOP, Collections & DSA Basics")
                .description("Classes, encapsulation, inheritance, polymorphism, Java Collections Framework.")
                .monthRange("Month 2")
                .status("NOT_STARTED")
                .displayOrder(2)
                .build());

        createTopic(s2, "Classes & Objects", "NOT_STARTED", 1);
        createTopic(s2, "Constructors", "NOT_STARTED", 2);
        createTopic(s2, "Encapsulation", "NOT_STARTED", 3);
        createTopic(s2, "Inheritance", "NOT_STARTED", 4);
        createTopic(s2, "Polymorphism", "NOT_STARTED", 5);
        createTopic(s2, "Abstraction & Interfaces", "NOT_STARTED", 6);
        createTopic(s2, "Exception Handling", "NOT_STARTED", 7);
        createTopic(s2, "Java Collections (List, Set, Map)", "NOT_STARTED", 8);
        createTopic(s2, "Arrays, Strings, Searching & Sorting", "NOT_STARTED", 9);

        // Stage 3
        LearningStage s3 = stageRepository.save(LearningStage.builder()
                .stageNumber(3)
                .title("SQL, PostgreSQL & Git")
                .description("Relational databases, SQL queries, joins, subqueries, JDBC and Git workflows.")
                .monthRange("Month 3")
                .status("NOT_STARTED")
                .displayOrder(3)
                .build());

        createTopic(s3, "Relational Database Concepts", "NOT_STARTED", 1);
        createTopic(s3, "SQL Queries & Aggregations", "NOT_STARTED", 2);
        createTopic(s3, "Joins & Subqueries", "NOT_STARTED", 3);
        createTopic(s3, "PostgreSQL Setup & Indexing", "NOT_STARTED", 4);
        createTopic(s3, "Java Database Connectivity (JDBC)", "NOT_STARTED", 5);
        createTopic(s3, "Git & GitHub Version Control", "NOT_STARTED", 6);

        // Stage 4
        LearningStage s4 = stageRepository.save(LearningStage.builder()
                .stageNumber(4)
                .title("Spring Boot")
                .description("HTTP, REST APIs, Dependency Injection, Spring Data JPA, testing and Postman.")
                .monthRange("Months 4–5")
                .status("NOT_STARTED")
                .displayOrder(4)
                .build());

        createTopic(s4, "HTTP & REST APIs", "NOT_STARTED", 1);
        createTopic(s4, "JSON & HTTP Status Codes", "NOT_STARTED", 2);
        createTopic(s4, "Maven Build System", "NOT_STARTED", 3);
        createTopic(s4, "Spring Boot Fundamentals", "NOT_STARTED", 4);
        createTopic(s4, "Dependency Injection & IoC", "NOT_STARTED", 5);
        createTopic(s4, "Controller, Service & Repository Layers", "NOT_STARTED", 6);
        createTopic(s4, "Spring Data JPA & Hibernate", "NOT_STARTED", 7);
        createTopic(s4, "CRUD APIs & DTO Pattern", "NOT_STARTED", 8);
        createTopic(s4, "Validation & Exception Handling", "NOT_STARTED", 9);
        createTopic(s4, "Pagination & Sorting", "NOT_STARTED", 10);
        createTopic(s4, "Unit Testing with JUnit & Mockito", "NOT_STARTED", 11);
        createTopic(s4, "Postman API Testing", "NOT_STARTED", 12);

        // Stage 5
        LearningStage s5 = stageRepository.save(LearningStage.builder()
                .stageNumber(5)
                .title("Professional Projects")
                .description("E-commerce Order API, Authentication, Transactions, Docker and Deployment.")
                .monthRange("Months 6–7")
                .status("NOT_STARTED")
                .displayOrder(5)
                .build());

        createTopic(s5, "E-commerce Order Management API", "NOT_STARTED", 1);
        createTopic(s5, "Authentication & Authorization (Spring Security)", "NOT_STARTED", 2);
        createTopic(s5, "Database Transactions (@Transactional)", "NOT_STARTED", 3);
        createTopic(s5, "Logging & Telemetry", "NOT_STARTED", 4);
        createTopic(s5, "Environment Variables & Security Config", "NOT_STARTED", 5);
        createTopic(s5, "Docker Containerization", "NOT_STARTED", 6);
        createTopic(s5, "Cloud Deployment & Production Setup", "NOT_STARTED", 7);
        createTopic(s5, "DSA Practice & Problem Solving", "NOT_STARTED", 8);

        // Stage 6
        LearningStage s6 = stageRepository.save(LearningStage.builder()
                .stageNumber(6)
                .title("Advanced Foundations")
                .description("System Design, Microservices, Redis, Kafka, technical and HR interviews.")
                .monthRange("Months 8–10")
                .status("NOT_STARTED")
                .displayOrder(6)
                .build());

        createTopic(s6, "System Design Fundamentals", "NOT_STARTED", 1);
        createTopic(s6, "Monolithic & Microservices Architecture", "NOT_STARTED", 2);
        createTopic(s6, "Redis Caching", "NOT_STARTED", 3);
        createTopic(s6, "Kafka Message Streaming", "NOT_STARTED", 4);
        createTopic(s6, "Distributed Systems & Scalability", "NOT_STARTED", 5);
        createTopic(s6, "Reliability & Fault Tolerance", "NOT_STARTED", 6);
        createTopic(s6, "Technical Interviews (Java & Spring)", "NOT_STARTED", 7);
        createTopic(s6, "HR Preparation & Behavioral Questions", "NOT_STARTED", 8);
        createTopic(s6, "Job Applications & Career Launch", "NOT_STARTED", 9);

        log.info("Roadmap successfully initialized with 6 stages and 51 topics.");
    }

    private void createTopic(LearningStage stage, String title, String status, int order) {
        LearningTopic topic = LearningTopic.builder()
                .stage(stage)
                .title(title)
                .status(status)
                .displayOrder(order)
                .startDate("COMPLETED".equals(status) || "IN_PROGRESS".equals(status) ? LocalDate.now().minusDays(5)
                        : null)
                .completionDate("COMPLETED".equals(status) ? LocalDate.now().minusDays(2) : null)
                .build();
        topicRepository.save(topic);
    }
}
