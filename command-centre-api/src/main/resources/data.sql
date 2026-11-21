-- ═══════════════════════════════════════════════════════════
-- SEED: Owner account  (password: CommandCentre@2024)
-- BCrypt hash generated for: CommandCentre@2024
-- ═══════════════════════════════════════════════════════════
INSERT INTO owner (id, email, password_hash, name, created_at, updated_at)
VALUES (1, 'karthikvikash02@gmail.com',
        '$2a$12$LJ3m4ys3LzzKbNqtfc/Y7eFthkGMJxRpWDQ5FKz0RkbQtfVzXVLHa',
        'Karthik',
        NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- SEED: Learning Stages
-- ═══════════════════════════════════════════════════════════
INSERT INTO learning_stage (id, stage_number, title, description, month_range, status, display_order, created_at, updated_at) VALUES
(1, 1, 'Java Fundamentals', 'Core Java programming concepts and syntax', 'Month 1', 'NOT_STARTED', 1, NOW(), NOW()),
(2, 2, 'OOP, Collections & DSA Basics', 'Object-oriented programming, Java Collections and introductory data structures', 'Month 2', 'NOT_STARTED', 2, NOW(), NOW()),
(3, 3, 'SQL, PostgreSQL & Git', 'Relational databases, SQL querying, version control', 'Month 3', 'NOT_STARTED', 3, NOW(), NOW()),
(4, 4, 'Spring Boot', 'HTTP, REST APIs, Spring Boot framework, testing', 'Months 4-5', 'NOT_STARTED', 4, NOW(), NOW()),
(5, 5, 'Professional Projects', 'Real-world project development, deployment, Docker', 'Months 6-7', 'NOT_STARTED', 5, NOW(), NOW()),
(6, 6, 'Advanced Foundations', 'System design, microservices, interview preparation', 'Months 8-10', 'NOT_STARTED', 6, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- SEED: Learning Topics per Stage
-- ═══════════════════════════════════════════════════════════

-- Stage 1: Java Fundamentals
INSERT INTO learning_topic (id, stage_id, title, notes, resources, status, start_date, completion_date, display_order, created_at, updated_at) VALUES
(1,  1, 'Java Installation & Setup', '', '', 'NOT_STARTED', NULL, NULL, 1, NOW(), NOW()),
(2,  1, 'Variables & Data Types', '', '', 'NOT_STARTED', NULL, NULL, 2, NOW(), NOW()),
(3,  1, 'Operators & Expressions', '', '', 'NOT_STARTED', NULL, NULL, 3, NOW(), NOW()),
(4,  1, 'Input & Output', '', '', 'NOT_STARTED', NULL, NULL, 4, NOW(), NOW()),
(5,  1, 'Conditions & Loops', '', '', 'NOT_STARTED', NULL, NULL, 5, NOW(), NOW()),
(6,  1, 'Methods', '', '', 'NOT_STARTED', NULL, NULL, 6, NOW(), NOW()),
(7,  1, 'Arrays & Strings', '', '', 'NOT_STARTED', NULL, NULL, 7, NOW(), NOW()),

-- Stage 2: OOP, Collections & DSA
(8,  2, 'Classes & Objects', '', '', 'NOT_STARTED', NULL, NULL, 1, NOW(), NOW()),
(9,  2, 'Constructors', '', '', 'NOT_STARTED', NULL, NULL, 2, NOW(), NOW()),
(10, 2, 'Encapsulation', '', '', 'NOT_STARTED', NULL, NULL, 3, NOW(), NOW()),
(11, 2, 'Inheritance', '', '', 'NOT_STARTED', NULL, NULL, 4, NOW(), NOW()),
(12, 2, 'Polymorphism', '', '', 'NOT_STARTED', NULL, NULL, 5, NOW(), NOW()),
(13, 2, 'Abstraction & Interfaces', '', '', 'NOT_STARTED', NULL, NULL, 6, NOW(), NOW()),
(14, 2, 'Exception Handling', '', '', 'NOT_STARTED', NULL, NULL, 7, NOW(), NOW()),
(15, 2, 'Java Collections', '', '', 'NOT_STARTED', NULL, NULL, 8, NOW(), NOW()),
(16, 2, 'Arrays, Strings, Searching & Sorting', '', '', 'NOT_STARTED', NULL, NULL, 9, NOW(), NOW()),

-- Stage 3: SQL, PostgreSQL & Git
(17, 3, 'Relational Database Concepts', '', '', 'NOT_STARTED', NULL, NULL, 1, NOW(), NOW()),
(18, 3, 'SQL Queries', '', '', 'NOT_STARTED', NULL, NULL, 2, NOW(), NOW()),
(19, 3, 'Joins & Subqueries', '', '', 'NOT_STARTED', NULL, NULL, 3, NOW(), NOW()),
(20, 3, 'PostgreSQL', '', '', 'NOT_STARTED', NULL, NULL, 4, NOW(), NOW()),
(21, 3, 'Java Database Connectivity (JDBC)', '', '', 'NOT_STARTED', NULL, NULL, 5, NOW(), NOW()),
(22, 3, 'Git & GitHub', '', '', 'NOT_STARTED', NULL, NULL, 6, NOW(), NOW()),

-- Stage 4: Spring Boot
(23, 4, 'HTTP & REST APIs', '', '', 'NOT_STARTED', NULL, NULL, 1, NOW(), NOW()),
(24, 4, 'JSON & Status Codes', '', '', 'NOT_STARTED', NULL, NULL, 2, NOW(), NOW()),
(25, 4, 'Maven', '', '', 'NOT_STARTED', NULL, NULL, 3, NOW(), NOW()),
(26, 4, 'Spring Boot Basics', '', '', 'NOT_STARTED', NULL, NULL, 4, NOW(), NOW()),
(27, 4, 'Dependency Injection', '', '', 'NOT_STARTED', NULL, NULL, 5, NOW(), NOW()),
(28, 4, 'Controller, Service & Repository Layers', '', '', 'NOT_STARTED', NULL, NULL, 6, NOW(), NOW()),
(29, 4, 'Spring Data JPA', '', '', 'NOT_STARTED', NULL, NULL, 7, NOW(), NOW()),
(30, 4, 'CRUD APIs', '', '', 'NOT_STARTED', NULL, NULL, 8, NOW(), NOW()),
(31, 4, 'Validation & Exception Handling', '', '', 'NOT_STARTED', NULL, NULL, 9, NOW(), NOW()),
(32, 4, 'Pagination & Sorting', '', '', 'NOT_STARTED', NULL, NULL, 10, NOW(), NOW()),
(33, 4, 'JUnit & Mockito', '', '', 'NOT_STARTED', NULL, NULL, 11, NOW(), NOW()),
(34, 4, 'Postman', '', '', 'NOT_STARTED', NULL, NULL, 12, NOW(), NOW()),

-- Stage 5: Professional Projects
(35, 5, 'E-commerce Order Management API', '', '', 'NOT_STARTED', NULL, NULL, 1, NOW(), NOW()),
(36, 5, 'Authentication & Authorisation', '', '', 'NOT_STARTED', NULL, NULL, 2, NOW(), NOW()),
(37, 5, 'Database Transactions', '', '', 'NOT_STARTED', NULL, NULL, 3, NOW(), NOW()),
(38, 5, 'Logging', '', '', 'NOT_STARTED', NULL, NULL, 4, NOW(), NOW()),
(39, 5, 'Environment Variables', '', '', 'NOT_STARTED', NULL, NULL, 5, NOW(), NOW()),
(40, 5, 'Docker', '', '', 'NOT_STARTED', NULL, NULL, 6, NOW(), NOW()),
(41, 5, 'Deployment', '', '', 'NOT_STARTED', NULL, NULL, 7, NOW(), NOW()),
(42, 5, 'DSA Practice', '', '', 'NOT_STARTED', NULL, NULL, 8, NOW(), NOW()),

-- Stage 6: Advanced Foundations
(43, 6, 'System Design', '', '', 'NOT_STARTED', NULL, NULL, 1, NOW(), NOW()),
(44, 6, 'Monolithic & Microservices Architecture', '', '', 'NOT_STARTED', NULL, NULL, 2, NOW(), NOW()),
(45, 6, 'Redis', '', '', 'NOT_STARTED', NULL, NULL, 3, NOW(), NOW()),
(46, 6, 'Kafka', '', '', 'NOT_STARTED', NULL, NULL, 4, NOW(), NOW()),
(47, 6, 'Distributed Systems', '', '', 'NOT_STARTED', NULL, NULL, 5, NOW(), NOW()),
(48, 6, 'Scalability & Reliability', '', '', 'NOT_STARTED', NULL, NULL, 6, NOW(), NOW()),
(49, 6, 'Technical Interviews', '', '', 'NOT_STARTED', NULL, NULL, 7, NOW(), NOW()),
(50, 6, 'HR Preparation', '', '', 'NOT_STARTED', NULL, NULL, 8, NOW(), NOW()),
(51, 6, 'Job Applications', '', '', 'NOT_STARTED', NULL, NULL, 9, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
