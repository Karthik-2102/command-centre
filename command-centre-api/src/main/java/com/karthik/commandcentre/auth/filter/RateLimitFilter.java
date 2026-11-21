package com.karthik.commandcentre.auth.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.karthik.commandcentre.auth.service.SessionService;
import com.karthik.commandcentre.common.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final SessionService sessionService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.rate-limit.login-attempts-per-minute:10}")
    private int maxRequestsPerMinute;

    private final Map<String, Deque<Long>> requestLogPerIp = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();

        // Only rate limit authentication mutation endpoints
        if (uri.startsWith("/api/v1/auth/login") ||
            uri.startsWith("/api/v1/auth/verify-password") ||
            uri.startsWith("/api/v1/auth/verify-otp") ||
            uri.startsWith("/api/v1/auth/resend-otp")) {

            String ip = sessionService.extractClientIp(request);
            long now = System.currentTimeMillis();
            long windowStart = now - 60_000; // 1 minute window

            Deque<Long> timestamps = requestLogPerIp.computeIfAbsent(ip, k -> new ArrayDeque<>());

            synchronized (timestamps) {
                // Evict entries older than 1 minute
                while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
                    timestamps.pollFirst();
                }

                if (timestamps.size() >= maxRequestsPerMinute) {
                    log.warn("Rate limit exceeded for IP: {} on URI: {}", ip, uri);
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    ApiResponse<Void> apiResponse = ApiResponse.error("Too many login requests. Please wait a minute before retrying.");
                    response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                    return;
                }

                timestamps.addLast(now);
            }
        }

        filterChain.doFilter(request, response);
    }
}
