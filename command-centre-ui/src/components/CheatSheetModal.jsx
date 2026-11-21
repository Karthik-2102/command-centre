import React, { useState, useEffect } from "react";
import { Terminal, Copy, Check, X, Search, BookOpen, Code, Database, Box, GitBranch, Edit3 } from "lucide-react";

const CHEAT_SHEETS = {
  spring: {
    label: "Spring Boot",
    icon: Code,
    items: [
      {
        title: "REST Controller Pattern",
        code: `@RestController\n@RequestMapping("/api/v1/orders")\n@RequiredArgsConstructor\npublic class OrderController {\n    private final OrderService orderService;\n\n    @PostMapping\n    public ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrderRequest req) {\n        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(req));\n    }\n}`,
      },
      {
        title: "Global Exception Handler",
        code: `@RestControllerAdvice\npublic class GlobalExceptionHandler {\n    @ExceptionHandler(ApiException.class)\n    public ResponseEntity<ApiResponse<Void>> handle(ApiException ex) {\n        return ResponseEntity.status(ex.getStatus()).body(ApiResponse.error(ex.getMessage()));\n    }\n}`,
      },
      {
        title: "Spring Data JPA Derived Query & Native Query",
        code: `public interface OrderRepository extends JpaRepository<Order, Long> {\n    // Derived Query\n    List<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);\n\n    // JPQL with Fetch Join\n    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id")\n    Optional<Order> findByIdWithItems(@Param("id") Long id);\n}`,
      },
      {
        title: "Spring Security 6 Stateless FilterChain",
        code: `@Bean\npublic SecurityFilterChain filterChain(HttpSecurity http) throws Exception {\n    return http\n        .csrf(AbstractHttpConfigurer::disable)\n        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))\n        .authorizeHttpRequests(a -> a\n            .requestMatchers("/api/v1/auth/**").permitAll()\n            .anyRequest().authenticated())\n        .build();\n}`,
      },
    ],
  },
  java: {
    label: "Java 21 Core",
    icon: Terminal,
    items: [
      {
        title: "Streams API (Filter, Map, Collect)",
        code: `List<String> activeNames = users.stream()\n    .filter(User::isActive)\n    .map(User::getName)\n    .sorted(Comparator.naturalOrder())\n    .collect(Collectors.toList());`,
      },
      {
        title: "Grouping & Partitioning by Collector",
        code: `Map<Department, List<Employee>> byDept = employees.stream()\n    .collect(Collectors.groupingBy(Employee::getDepartment));\n\nMap<Boolean, List<Student>> passedVsFailed = students.stream()\n    .collect(Collectors.partitioningBy(s -> s.getGrade() >= 50));`,
      },
      {
        title: "Records & Pattern Matching (Java 17/21)",
        code: `public record OrderSummary(Long id, BigDecimal amount, String status) {}\n\n// Pattern matching switch\nString message = switch (response) {\n    case Success(var data) -> "Received: " + data;\n    case Error(var code, var msg) -> "Error " + code + ": " + msg;\n};`,
      },
      {
        title: "CompletableFuture & Virtual Threads",
        code: `// Virtual Thread Executor (Java 21)\ntry (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    IntStream.range(0, 10_000).forEach(i -> {\n        executor.submit(() -> fetchFromDb(i));\n    });\n}`,
      },
    ],
  },
  sql: {
    label: "PostgreSQL",
    icon: Database,
    items: [
      {
        title: "High Performance Indexes & Explain Analyze",
        code: `-- B-tree index on foreign key + active status\nCREATE INDEX idx_orders_user_active ON orders(user_id, is_active);\n\n-- Inspect Query Execution Plan\nEXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42 AND is_active = true;`,
      },
      {
        title: "Common Table Expression (CTE) & Window Functions",
        code: `WITH ranked_orders AS (\n    SELECT id, user_id, amount,\n           DENSE_RANK() OVER (PARTITION BY user_id ORDER BY amount DESC) as rnk\n    FROM orders\n)\nSELECT * FROM ranked_orders WHERE rnk <= 3;`,
      },
      {
        title: "Upsert (ON CONFLICT DO UPDATE)",
        code: `INSERT INTO daily_metrics (date, study_hours, dsa_count)\nVALUES ('2026-11-20', 3.5, 4)\nON CONFLICT (date) \nDO UPDATE SET \n    study_hours = daily_metrics.study_hours + EXCLUDED.study_hours,\n    dsa_count = daily_metrics.dsa_count + EXCLUDED.dsa_count;`,
      },
    ],
  },
  devops: {
    label: "Docker & Git",
    icon: Box,
    items: [
      {
        title: "Dockerfile for Spring Boot (Multi-Stage Build)",
        code: `# Build Stage\nFROM maven:3.9-eclipse-temurin-21 AS build\nWORKDIR /app\nCOPY pom.xml . \nRUN mvn dependency:go-offline\nCOPY src ./src\nRUN mvn clean package -DskipTests\n\n# Run Stage\nFROM eclipse-temurin:21-jre-alpine\nWORKDIR /app\nCOPY --from=build /app/target/*.jar app.jar\nEXPOSE 8080\nENTRYPOINT ["java", "-jar", "app.jar"]`,
      },
      {
        title: "docker-compose.yml for PostgreSQL + Spring Boot",
        code: `services:\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_DB: command_centre\n      POSTGRES_USER: postgres\n      POSTGRES_PASSWORD: secret\n    ports:\n      - "5432:5432"\n    volumes:\n      - pgdata:/var/lib/postgresql/data\nvolumes:\n  pgdata:`,
      },
      {
        title: "Essential Git Commands for Developers",
        code: `# Stash uncommitted changes\ngit stash -u\ngit pull --rebase origin main\ngit stash pop\n\n# Squash last 3 commits into one\ngit reset --soft HEAD~3\ngit commit -m "feat: complete order API"\n\n# Revert without rewriting history\ngit revert <commit-hash>`,
      },
    ],
  },
};

export default function CheatSheetModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("spring");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scratchpad, setScratchpad] = useState(() => {
    return localStorage.getItem("cc_dev_scratchpad") || "// Karthik's Quick Notes & Code Snippets\n\n";
  });

  useEffect(() => {
    localStorage.setItem("cc_dev_scratchpad", scratchpad);
  }, [scratchpad]);

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const currentTabItems = CHEAT_SHEETS[activeTab]?.items || [];
  const filteredItems = currentTabItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-fade-in">
      <div className="w-full max-w-4xl h-[85vh] max-h-[750px] bg-dark-card border border-dark-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="h-16 px-6 border-b border-dark-border flex items-center justify-between shrink-0 bg-dark-card/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Developer Command Quick-Pad</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-dark-bg border border-dark-border text-gray-400">
                  Ctrl + K
                </span>
              </h2>
              <p className="text-[11px] text-gray-400 font-mono">
                Production-grade Spring Boot, Java, PostgreSQL & DevOps snippets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-dark-border/80 bg-dark-bg/60 overflow-x-auto shrink-0">
          {Object.entries(CHEAT_SHEETS).map(([key, item]) => {
            const Icon = item.icon;
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  active
                    ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-dark-hover"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveTab("scratchpad")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
              activeTab === "scratchpad"
                ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                : "text-gray-400 hover:text-white hover:bg-dark-hover"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>My Scratchpad</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === "scratchpad" ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-400">
                  Persistent Local Notes & Snippets (Auto-saved)
                </span>
                <span className="text-[11px] text-neon-cyan font-mono">
                  Saved automatically
                </span>
              </div>
              <textarea
                value={scratchpad}
                onChange={(e) => setScratchpad(e.target.value)}
                placeholder="Jot down temporary SQL queries, API endpoints, bug notes, or interview facts..."
                className="flex-1 w-full p-4 rounded-xl bg-dark-bg border border-dark-border font-mono text-xs text-gray-200 focus:outline-none focus:border-neon-cyan/50 resize-none leading-relaxed"
              />
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={`Search ${CHEAT_SHEETS[activeTab]?.label} snippets...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b1017] border border-[#1e293b] text-xs text-white placeholder-gray-500 hover:border-cyan-500/40 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                />
              </div>

              {/* Snippets list */}
              {filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-dark-bg/90 border border-dark-border p-4 transition-all hover:border-dark-border/80"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-semibold text-white font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                      {item.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => copyCode(item.code, idx)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-card border border-dark-border text-[11px] font-mono text-gray-300 hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-3.5 rounded-lg bg-black/40 border border-dark-border/60 overflow-x-auto text-[11px] font-mono text-cyan-300 leading-relaxed">
                    <code>{item.code}</code>
                  </pre>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-xs font-mono">
                  No snippets found matching "{searchQuery}"
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
