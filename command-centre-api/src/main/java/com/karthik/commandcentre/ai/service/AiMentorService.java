package com.karthik.commandcentre.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.karthik.commandcentre.ai.dto.*;
import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.OwnerRepository;
import com.karthik.commandcentre.common.exception.ApiException;
import com.karthik.commandcentre.dsa.dto.CreateDsaProblemRequest;
import com.karthik.commandcentre.dsa.entity.DsaProblem;
import com.karthik.commandcentre.dsa.repository.DsaProblemRepository;
import com.karthik.commandcentre.dsa.service.DsaProblemService;
import com.karthik.commandcentre.roadmap.entity.LearningStage;
import com.karthik.commandcentre.roadmap.entity.LearningTopic;
import com.karthik.commandcentre.roadmap.repository.LearningStageRepository;
import com.karthik.commandcentre.task.dto.CreateTaskRequest;
import com.karthik.commandcentre.task.entity.Task;
import com.karthik.commandcentre.task.repository.TaskRepository;
import com.karthik.commandcentre.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiMentorService {

    private final LearningStageRepository learningStageRepository;
    private final TaskRepository taskRepository;
    private final DsaProblemRepository dsaProblemRepository;
    private final TaskService taskService;
    private final DsaProblemService dsaProblemService;
    private final OwnerRepository ownerRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.owner.email:karthikvikash02@gmail.com}")
    private String defaultOwnerEmail;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-3.5-flash-lite}")
    private String geminiModel;

    @Value("${app.groq.api-key:}")
    private String groqApiKey;

    @Value("${app.groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    @Value("${app.ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${app.ollama.model:llama3}")
    private String ollamaModel;

    private static final Pattern TASK_PATTERN = Pattern
            .compile("\\[TASK:\\s*([^\\|\\]]+)\\s*\\|\\s*([^\\|\\]]+)\\s*\\|\\s*([^\\]]+)\\]");
    private static final Pattern DSA_PATTERN = Pattern
            .compile("\\[DSA:\\s*([^\\|\\]]+)\\s*\\|\\s*([^\\|\\]]+)\\s*\\|\\s*([^\\|\\]]+)\\s*\\|\\s*([^\\]]+)\\]");

    public Owner getOwner() {
        return ownerRepository.findByEmail(defaultOwnerEmail)
                .orElseGet(() -> ownerRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> ApiException.notFound("Owner not found")));
    }

    /**
     * Aggregates live database progress into a structured DTO for the mentor context.
     */
    public AiMentorContextDto getMentorContext() {
        Owner owner = getOwner();
        List<LearningStage> stages = learningStageRepository.findAllByOrderByDisplayOrderAsc();

        int totalTopics = 0;
        List<String> completedTopics = new ArrayList<>();
        List<String> inProgressTopics = new ArrayList<>();
        List<String> upcomingInCurrentStage = new ArrayList<>();
        String currentStageTitle = "Stage 1: Java Fundamentals";
        int currentStageNumber = 1;
        String monthRange = "Month 1";
        String nextRecommendedTopic = null;

        boolean foundNext = false;

        for (LearningStage stage : stages) {
            List<LearningTopic> topics = stage.getTopics() != null ? stage.getTopics() : Collections.emptyList();
            for (LearningTopic topic : topics) {
                totalTopics++;
                if ("COMPLETED".equalsIgnoreCase(topic.getStatus())) {
                    completedTopics.add(topic.getTitle());
                } else if ("IN_PROGRESS".equalsIgnoreCase(topic.getStatus())) {
                    inProgressTopics.add(topic.getTitle());
                    if (!foundNext) {
                        nextRecommendedTopic = topic.getTitle();
                        currentStageTitle = stage.getTitle();
                        currentStageNumber = stage.getStageNumber();
                        monthRange = stage.getMonthRange();
                        foundNext = true;
                    }
                } else {
                    if (!foundNext) {
                        nextRecommendedTopic = topic.getTitle();
                        currentStageTitle = stage.getTitle();
                        currentStageNumber = stage.getStageNumber();
                        monthRange = stage.getMonthRange();
                        foundNext = true;
                    }
                    if (stage.getStageNumber() == currentStageNumber) {
                        upcomingInCurrentStage.add(topic.getTitle());
                    }
                }
            }
        }

        if (nextRecommendedTopic == null && !stages.isEmpty()) {
            nextRecommendedTopic = "Revision & Production Capstone Projects";
        }

        int completedCount = completedTopics.size();
        int progressPct = totalTopics > 0 ? (int) Math.round((double) completedCount / totalTopics * 100) : 0;

        List<DsaProblem> solvedDsa = dsaProblemRepository.findByOwnerIdAndStatus(owner.getId(), "SOLVED");
        List<Task> pendingTasks = taskRepository.findByOwnerIdAndStatus(owner.getId(), "PENDING");

        boolean hasGemini = isKeyValid(geminiApiKey);
        boolean hasGroq = isKeyValid(groqApiKey);

        List<String> available = new ArrayList<>(List.of("AUTO", "LOCAL"));
        if (hasGemini) available.add("GEMINI");
        if (hasGroq) available.add("GROQ");
        available.add("OLLAMA");

        return AiMentorContextDto.builder()
                .stageTitle(currentStageTitle)
                .stageNumber(currentStageNumber)
                .monthRange(monthRange)
                .completedTopicsCount(completedCount)
                .totalTopicsCount(totalTopics)
                .progressPercentage(progressPct)
                .completedTopics(completedTopics)
                .inProgressTopics(inProgressTopics)
                .nextRecommendedTopic(nextRecommendedTopic)
                .upcomingTopicsInCurrentStage(upcomingInCurrentStage)
                .solvedDsaCount(solvedDsa.size())
                .pendingTasksCount(pendingTasks.size())
                .hasGeminiApiKey(hasGemini)
                .hasGroqApiKey(hasGroq)
                .isOllamaConfigured(true)
                .availableModels(available)
                .build();
    }

    private boolean isKeyValid(String key) {
        return key != null && !key.isBlank() && !key.equalsIgnoreCase("your_api_key_here") && !key.equalsIgnoreCase("your_gemini_api_key");
    }

    /**
     * Handles conversation with the AI Mentor with Smart Auto-Fallback Cascade.
     */
    public AiChatResponse chat(AiChatRequest request) {
        AiMentorContextDto context = getMentorContext();
        String preferred = request.getPreferredModel() != null ? request.getPreferredModel().toUpperCase() : "AUTO";

        // Direct explicit model selection
        if ("LOCAL".equalsIgnoreCase(preferred)) {
            return generateDeterministicMentorReply(request, context, null);
        }

        if ("GROQ".equalsIgnoreCase(preferred) && context.isHasGroqApiKey()) {
            try {
                return callGroqApi(request, context, false, null);
            } catch (Exception e) {
                log.warn("Direct Groq request failed: {}. Falling back to Auto cascade.", e.getMessage());
            }
        }

        if ("OLLAMA".equalsIgnoreCase(preferred)) {
            try {
                return callOllamaApi(request, context, false, null);
            } catch (Exception e) {
                log.warn("Direct Ollama request failed: {}. Falling back to Auto cascade.", e.getMessage());
            }
        }

        if ("GEMINI".equalsIgnoreCase(preferred) && context.isHasGeminiApiKey()) {
            try {
                return callGeminiApi(request, context, false, null);
            } catch (Exception e) {
                log.warn("Direct Gemini request failed: {}. Falling back to Auto cascade.", e.getMessage());
            }
        }

        // ==========================================
        // AUTO CASCADE: Gemini -> Groq -> Ollama -> Local
        // ==========================================
        String fallbackReason = null;

        // Stage 1: Try Gemini
        if (context.isHasGeminiApiKey()) {
            try {
                return callGeminiApi(request, context, false, null);
            } catch (Exception e) {
                log.warn("Gemini unavailable or quota reached: {}. Auto-switching to next provider.", e.getMessage());
                fallbackReason = "Gemini quota/network limit reached. Auto-switched.";
            }
        }

        // Stage 2: Try Groq
        if (context.isHasGroqApiKey()) {
            try {
                return callGroqApi(request, context, fallbackReason != null, fallbackReason);
            } catch (Exception e) {
                log.warn("Groq unavailable: {}. Auto-switching to Ollama/Local.", e.getMessage());
                fallbackReason = "Cloud AI quota reached. Auto-switched to local engine.";
            }
        }

        // Stage 3: Try Ollama (Local LLM server)
        try {
            return callOllamaApi(request, context, fallbackReason != null, fallbackReason);
        } catch (Exception e) {
            log.debug("Ollama local runner not responding on {}: {}", ollamaBaseUrl, e.getMessage());
        }

        // Stage 4: Deterministic Local Telemetry Engine (100% available offline)
        return generateDeterministicMentorReply(request, context, fallbackReason);
    }

    /**
     * Calls Google Gemini REST API.
     */
    private AiChatResponse callGeminiApi(AiChatRequest request, AiMentorContextDto context, boolean fallbackTriggered, String fallbackReason) throws Exception {
        String systemInstruction = buildSystemPrompt(context);

        Map<String, Object> payload = new HashMap<>();
        Map<String, Object> sysInstructionMap = new HashMap<>();
        sysInstructionMap.put("parts", List.of(Map.of("text", systemInstruction)));
        payload.put("system_instruction", sysInstructionMap);

        List<Map<String, Object>> contents = new ArrayList<>();
        if (request.getConversationHistory() != null) {
            for (AiChatRequest.ChatMessage msg : request.getConversationHistory()) {
                String role = "user".equalsIgnoreCase(msg.getRole()) ? "user" : "model";
                contents.add(Map.of("role", role, "parts", List.of(Map.of("text", msg.getContent()))));
            }
        }

        String userPrompt = request.getPrompt();
        if (request.getCodeSnippet() != null && !request.getCodeSnippet().isBlank()) {
            userPrompt += "\n\n--- ATTACHED CODE / DOCUMENT / TEXT ---\n" + request.getCodeSnippet() + "\n-----------------------------------------";
        }
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt))));
        payload.put("contents", contents);

        payload.put("generationConfig", Map.of(
                "temperature", 0.7,
                "topK", 40,
                "topP", 0.95,
                "maxOutputTokens", 2048));

        List<String> modelsToTry = new ArrayList<>();
        if (geminiModel != null && !geminiModel.isBlank()) {
            modelsToTry.add(geminiModel.trim());
        }
        for (String m : List.of("gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest")) {
            if (!modelsToTry.contains(m)) {
                modelsToTry.add(m);
            }
        }

        RestClient restClient = RestClient.builder().build();
        Exception lastException = null;

        for (String targetModel : modelsToTry) {
            try {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + targetModel + ":generateContent?key=" + geminiApiKey.trim();
                String responseBody = restClient.post()
                        .uri(url)
                        .header("x-goog-api-key", geminiApiKey.trim())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(payload)
                        .retrieve()
                        .body(String.class);

                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode candidates = root.path("candidates");

                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        String replyText = parts.get(0).path("text").asText();
                        AiChatResponse response = parseActionsFromReply(replyText, context, false);
                        response.setActiveModel("Google Gemini (" + targetModel + ")");
                        response.setProvider("GEMINI");
                        response.setFallbackTriggered(fallbackTriggered);
                        response.setFallbackReason(fallbackReason);
                        return response;
                    }
                }
            } catch (Exception e) {
                lastException = e;
                log.warn("Gemini model {} failed: {}. Trying alternative flash model if available...", targetModel, e.getMessage());
            }
        }

        throw lastException != null ? lastException : new RuntimeException("Empty or invalid candidate in Gemini response");
    }

    /**
     * Calls Groq OpenAI-compatible Cloud API (Llama 3.3 70B / Llama 3.1 8B).
     */
    private AiChatResponse callGroqApi(AiChatRequest request, AiMentorContextDto context, boolean fallbackTriggered, String fallbackReason) throws Exception {
        String systemInstruction = buildSystemPrompt(context);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemInstruction));

        if (request.getConversationHistory() != null) {
            for (AiChatRequest.ChatMessage msg : request.getConversationHistory()) {
                String role = "user".equalsIgnoreCase(msg.getRole()) ? "user" : "assistant";
                messages.add(Map.of("role", role, "content", msg.getContent()));
            }
        }

        String userPrompt = request.getPrompt();
        if (request.getCodeSnippet() != null && !request.getCodeSnippet().isBlank()) {
            userPrompt += "\n\n--- ATTACHED CODE / DOCUMENT / TEXT ---\n" + request.getCodeSnippet() + "\n-----------------------------------------";
        }
        messages.add(Map.of("role", "user", "content", userPrompt));

        Map<String, Object> payload = Map.of(
                "model", groqModel,
                "messages", messages,
                "temperature", 0.7,
                "max_tokens", 2048
        );

        String url = "https://api.groq.com/openai/v1/chat/completions";

        RestClient restClient = RestClient.builder().build();
        String responseBody = restClient.post()
                .uri(url)
                .header("Authorization", "Bearer " + groqApiKey.trim())
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(String.class);

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode choices = root.path("choices");
        if (choices.isArray() && !choices.isEmpty()) {
            String replyText = choices.get(0).path("message").path("content").asText();
            AiChatResponse response = parseActionsFromReply(replyText, context, false);
            response.setActiveModel("Groq (" + groqModel + ")");
            response.setProvider("GROQ");
            response.setFallbackTriggered(fallbackTriggered);
            response.setFallbackReason(fallbackReason != null ? fallbackReason : "Powered by Groq High-Speed Inference");
            return response;
        }

        throw new RuntimeException("Empty or invalid choices in Groq response");
    }

    /**
     * Calls local Ollama runner at http://localhost:11434.
     */
    private AiChatResponse callOllamaApi(AiChatRequest request, AiMentorContextDto context, boolean fallbackTriggered, String fallbackReason) throws Exception {
        String systemInstruction = buildSystemPrompt(context);

        String userPrompt = request.getPrompt();
        if (request.getCodeSnippet() != null && !request.getCodeSnippet().isBlank()) {
            userPrompt += "\n\n--- ATTACHED CODE / DOCUMENT / TEXT ---\n" + request.getCodeSnippet() + "\n-----------------------------------------";
        }

        Map<String, Object> payload = Map.of(
                "model", ollamaModel,
                "system", systemInstruction,
                "prompt", userPrompt,
                "stream", false
        );

        String url = ollamaBaseUrl.replaceAll("/$", "") + "/api/generate";

        RestClient restClient = RestClient.builder().build();
        String responseBody = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(String.class);

        JsonNode root = objectMapper.readTree(responseBody);
        String replyText = root.path("response").asText();
        if (replyText != null && !replyText.isBlank()) {
            AiChatResponse response = parseActionsFromReply(replyText, context, false);
            response.setActiveModel("Ollama Local (" + ollamaModel + ")");
            response.setProvider("OLLAMA");
            response.setFallbackTriggered(fallbackTriggered);
            response.setFallbackReason(fallbackReason != null ? fallbackReason : "Powered by Local Ollama Instance");
            return response;
        }

        throw new RuntimeException("Empty response from Ollama");
    }

    /**
     * Builds strict system instruction embedding Karthik's live learning state.
     */
    private String buildSystemPrompt(AiMentorContextDto context) {
        return """
                You are Karthik's Personal AI Mentor & Universal Engineering Assistant inside his private Developer Command Centre.
                Karthik is a BCA student at Manipal University Jaipur on a 10-month backend engineering curriculum to become an industry-ready Software Engineer.

                KARTHIK'S LIVE DASHBOARD TELEMETRY:
                - Current Roadmap Stage: %s (Stage %d of 6, %s)
                - Overall Roadmap Progress: %d / %d topics completed (%d%%)
                - Topics Completed So Far: %s
                - Topics Currently In Progress: %s
                - Immediate Next Recommended Topic: %s
                - Remaining Topics in this Stage: %s
                - DSA Problems Solved: %d problems tracked
                - Pending Tasks in Backlog: %d tasks

                UNIVERSAL MENTOR CAPABILITIES & PROTOCOLS:
                1. MULTI-LANGUAGE & GENERAL INTELLIGENCE:
                   - You support ALL programming languages (Python, Java, C++, JavaScript/TypeScript, Go, Rust, SQL, C#, Bash, etc.).
                   - You are NOT limited to coding! You excel in general conversation, everyday talking, general knowledge, career advice, document/article reading, text summarization, logic, science, and interview preparation.
                   - When text, documents, code snippets, or error logs are attached or pasted, thoroughly read, explain, summarize, or debug them.
                2. ROADMAP GUIDANCE:
                   - When Karthik specifically asks about his learning roadmap, progress, or what to study next, guide him sequentially based on his telemetry.
                   - Immediate Next Roadmap Topic: "%s".
                3. CODE & DOCUMENT ANALYSIS:
                   - When code is provided in ANY language, inspect it for Time & Space complexity (Big-O), edge cases, security, and clean code idioms.
                   - When documents or articles are pasted, provide clear insights, key takeaways, and answer any specific questions.
                4. 1-CLICK ACTIONABLE TOKENS:
                   When suggesting practical tasks or DSA problems, include them on separate lines using these exact formats so the Command Centre UI can render them as 1-click database injection cards:
                   [TASK: task title | HIGH/MEDIUM/LOW | DSA/Learning/Backend/Project]
                   [DSA: problem name | LeetCode/GeeksForGeeks/HackerRank | Topic | EASY/MEDIUM/HARD]
                   Example:
                   [TASK: Implement Matrix Traversal | HIGH | DSA]
                   [DSA: Rotate Image | LeetCode | Arrays | MEDIUM]
                5. Output clean, readable GitHub-flavored markdown with syntax-highlighted code blocks.
                """
                .formatted(
                        context.getStageTitle(),
                        context.getStageNumber(),
                        context.getMonthRange(),
                        context.getCompletedTopicsCount(),
                        context.getTotalTopicsCount(),
                        context.getProgressPercentage(),
                        String.join(", ", context.getCompletedTopics()),
                        context.getInProgressTopics().isEmpty() ? "None"
                                : String.join(", ", context.getInProgressTopics()),
                        context.getNextRecommendedTopic(),
                        context.getUpcomingTopicsInCurrentStage().isEmpty() ? "None"
                                : String.join(", ", context.getUpcomingTopicsInCurrentStage()),
                        context.getSolvedDsaCount(),
                        context.getPendingTasksCount(),
                        context.getNextRecommendedTopic());
    }

    /**
     * Extracts [TASK: ...] and [DSA: ...] tokens into interactive SuggestedAction items.
     */
    private AiChatResponse parseActionsFromReply(String reply, AiMentorContextDto context, boolean isFallback) {
        List<AiChatResponse.SuggestedAction> actions = new ArrayList<>();

        Matcher taskMatcher = TASK_PATTERN.matcher(reply);
        while (taskMatcher.find()) {
            String title = taskMatcher.group(1).trim();
            String priority = taskMatcher.group(2).trim().toUpperCase();
            String category = taskMatcher.group(3).trim();

            actions.add(AiChatResponse.SuggestedAction.builder()
                    .id(UUID.randomUUID().toString())
                    .type("TASK")
                    .title(title)
                    .priority(priority.contains("HIGH") ? "HIGH" : (priority.contains("LOW") ? "LOW" : "MEDIUM"))
                    .category(category)
                    .build());
        }

        Matcher dsaMatcher = DSA_PATTERN.matcher(reply);
        while (dsaMatcher.find()) {
            String title = dsaMatcher.group(1).trim();
            String platform = dsaMatcher.group(2).trim();
            String topic = dsaMatcher.group(3).trim();
            String difficulty = dsaMatcher.group(4).trim().toUpperCase();

            actions.add(AiChatResponse.SuggestedAction.builder()
                    .id(UUID.randomUUID().toString())
                    .type("DSA")
                    .title(title)
                    .platform(platform)
                    .topic(topic)
                    .difficulty(
                            difficulty.contains("HARD") ? "HARD" : (difficulty.contains("MEDIUM") ? "MEDIUM" : "EASY"))
                    .build());
        }

        String cleanReply = reply.replaceAll("\\[TASK:[^\\]]+\\]", "")
                .replaceAll("\\[DSA:[^\\]]+\\]", "")
                .trim();

        return AiChatResponse.builder()
                .reply(cleanReply.isEmpty() ? reply : cleanReply)
                .currentStage(context.getStageTitle())
                .currentTopic(context.getInProgressTopics().isEmpty() ? context.getNextRecommendedTopic()
                        : context.getInProgressTopics().get(0))
                .nextRecommendedTopic(context.getNextRecommendedTopic())
                .actions(actions)
                .isMockFallback(isFallback)
                .build();
    }

    /**
     * High-quality deterministic mentor response based on actual database roadmap state.
     */
    private AiChatResponse generateDeterministicMentorReply(AiChatRequest request, AiMentorContextDto context, String fallbackReason) {
        String prompt = request.getPrompt().toLowerCase();
        String nextTopic = context.getNextRecommendedTopic();
        String stageTitle = context.getStageTitle();

        StringBuilder reply = new StringBuilder();
        List<AiChatResponse.SuggestedAction> actions = new ArrayList<>();

        if (prompt.contains("next") || prompt.contains("learn") || prompt.contains("what should i")) {
            reply.append("### 🎯 Next Recommended Milestone: **").append(nextTopic).append("**\n\n");
            reply.append("Looking at your Command Centre telemetry, you are currently in **").append(stageTitle)
                    .append("** (")
                    .append(context.getProgressPercentage()).append("% completed).\n\n");
            reply.append("To keep your learning curve rock solid without skipping fundamentals, your next focus is **")
                    .append(nextTopic).append("**.\n\n");
            reply.append("#### Why this topic now?\n");
            reply.append("- It directly builds on what you've completed (")
                    .append(context.getCompletedTopics().isEmpty() ? "initial setup"
                            : String.join(", ", context.getCompletedTopics()))
                    .append(").\n");
            reply.append(
                    "- Skipping to advanced frameworks (like Spring Boot or System Design) before mastering this will leave knowledge gaps.\n\n");
            reply.append("#### Recommended Action Plan for Today:\n");
            reply.append("1. **Conceptual Understanding**: Review memory model and syntax for `").append(nextTopic)
                    .append("`.\n");
            reply.append("2. **Hands-On Coding**: Implement 2 practical implementations from scratch in Java.\n");
            reply.append("3. **DSA Connection**: Solve 2 targeted pattern questions.\n\n");

            actions.add(AiChatResponse.SuggestedAction.builder()
                    .id(UUID.randomUUID().toString())
                    .type("TASK")
                    .title("Master " + nextTopic + " Concepts & Notes")
                    .priority("HIGH")
                    .category("Learning")
                    .build());

            actions.add(AiChatResponse.SuggestedAction.builder()
                    .id(UUID.randomUUID().toString())
                    .type("DSA")
                    .title(nextTopic.contains("Array") ? "Find Min & Max in Array"
                            : "Implement " + nextTopic + " in Java")
                    .platform("LeetCode")
                    .topic(nextTopic.contains("Array") ? "Arrays" : "Java Basics")
                    .difficulty("EASY")
                    .build());

        } else if (prompt.contains("practice") || prompt.contains("question") || prompt.contains("exercise")) {
            reply.append("### 💻 Practice Drills for **").append(nextTopic).append("**\n\n");
            reply.append("Here are two curated practice challenges designed to cement your understanding:\n\n");
            reply.append("#### Exercise 1: Fundamental Traversal & Boundary Check\n");
            reply.append(
                    "Write a method in Java that takes input data, checks for edge conditions (`null`, empty, single element), and returns the transformed result without using library shortcuts.\n\n");
            reply.append("```java\n");
            reply.append("// Java 21 Practice Skeleton\n");
            reply.append("public class Practice {\n");
            reply.append("    public static void main(String[] args) {\n");
            reply.append("        int[] sample = {5, 2, 9, 1, 7};\n");
            reply.append("        System.out.println(\"Result: \" + solve(sample));\n");
            reply.append("    }\n\n");
            reply.append("    public static int solve(int[] nums) {\n");
            reply.append("        if (nums == null || nums.length == 0) return -1;\n");
            reply.append("        // Your logic here\n");
            reply.append("        return 0;\n");
            reply.append("    }\n");
            reply.append("}\n");
            reply.append("```\n\n");

            actions.add(AiChatResponse.SuggestedAction.builder()
                    .id(UUID.randomUUID().toString())
                    .type("TASK")
                    .title("Complete Practice Drills for " + nextTopic)
                    .priority("HIGH")
                    .category("DSA")
                    .build());

            actions.add(AiChatResponse.SuggestedAction.builder()
                    .id(UUID.randomUUID().toString())
                    .type("DSA")
                    .title("Two Sum / Linear Search Drill")
                    .platform("LeetCode")
                    .topic("Arrays")
                    .difficulty("EASY")
                    .build());

        } else if (request.getCodeSnippet() != null && !request.getCodeSnippet().isBlank()) {
            reply.append("### 🔍 Code & Document Analysis\n\n");
            reply.append("I evaluated your submitted snippet:\n\n");
            reply.append("- **Readability & Style**: Clean structure and standard naming conventions.\n");
            reply.append("- **Time & Space Complexity**: Standard linear or constant time depending on input size.\n");
            reply.append(
                    "- **Edge Cases to Watch**: Always guard against `null` pointers and boundary conditions (like empty inputs).\n");
            reply.append(
                    "- **Memory**: Objects allocated in loops should be minimized to avoid premature garbage collection overhead.\n\n");

            actions.add(AiChatResponse.SuggestedAction.builder()
                    .id(UUID.randomUUID().toString())
                    .type("TASK")
                    .title("Refactor & Add Unit Tests for Code Snippet")
                    .priority("MEDIUM")
                    .category("Backend")
                    .build());

        } else {
            reply.append("### 👋 Hello Karthik!\n\n");
            reply.append("I am your **Personal AI Learning Mentor** synced directly with your Command Centre.\n\n");
            reply.append("- **Current Stage**: ").append(stageTitle).append("\n");
            reply.append("- **Next Milestone**: **").append(nextTopic).append("**\n");
            reply.append("- **Progress**: ").append(context.getCompletedTopicsCount()).append(" of ")
                    .append(context.getTotalTopicsCount()).append(" topics completed (")
                    .append(context.getProgressPercentage()).append("%)\n\n");
            reply.append("You can ask me to:\n");
            reply.append("1. **Recommend what to learn next** based on your roadmap.\n");
            reply.append("2. **Explain tricky concepts** with code examples and ASCII diagrams.\n");
            reply.append("3. **Generate targeted practice tasks & DSA challenges**.\n");
            reply.append("4. **Review your code or documents** in any language for bugs, edge cases, and Big-O complexity.\n\n");

            actions.add(AiChatResponse.SuggestedAction.builder()
                    .id(UUID.randomUUID().toString())
                    .type("TASK")
                    .title("Start Sprint: " + nextTopic)
                    .priority("HIGH")
                    .category("Learning")
                    .build());
        }

        if (fallbackReason != null) {
            reply.append("\n\n> [!NOTE]\n> *Note: ").append(fallbackReason).append("*");
        }

        return AiChatResponse.builder()
                .reply(reply.toString())
                .currentStage(context.getStageTitle())
                .currentTopic(context.getNextRecommendedTopic())
                .nextRecommendedTopic(context.getNextRecommendedTopic())
                .actions(actions)
                .activeModel("Local Telemetry Engine")
                .provider("LOCAL")
                .fallbackTriggered(fallbackReason != null)
                .fallbackReason(fallbackReason)
                .isMockFallback(true)
                .build();
    }

    /**
     * Executes 1-click database injection for suggested actions (Task or DSA).
     */
    public Map<String, Object> executeQuickAction(QuickActionRequest request) {
        if ("DSA".equalsIgnoreCase(request.getActionType())) {
            CreateDsaProblemRequest dsaReq = CreateDsaProblemRequest.builder()
                    .title(request.getTitle())
                    .platform(request.getPlatform() != null ? request.getPlatform() : "LeetCode")
                    .topic(request.getTopic() != null ? request.getTopic() : "Arrays")
                    .difficulty(request.getDifficulty() != null ? request.getDifficulty() : "EASY")
                    .status("UNSOLVED")
                    .build();

            dsaProblemService.createProblem(dsaReq);
            return Map.of("success", true, "message", "Problem '" + request.getTitle() + "' added to DSA Practice list!");
        } else {
            CreateTaskRequest taskReq = CreateTaskRequest.builder()
                    .title(request.getTitle())
                    .description(request.getDescription() != null ? request.getDescription() : "AI Mentor recommended learning task")
                    .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                    .category(request.getCategory() != null ? request.getCategory() : "Learning")
                    .dueDate(LocalDate.now())
                    .build();

            taskService.createTask(taskReq);
            return Map.of("success", true, "message", "Task '" + request.getTitle() + "' added to your Tasks backlog!");
        }
    }
}
