package com.karthik.commandcentre.auth.service;

import com.karthik.commandcentre.auth.entity.AuthSession;
import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.AuthSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionService {

    public static final String COOKIE_NAME = "SESSION_ID";

    private final AuthSessionRepository authSessionRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.session.timeout-hours:24}")
    private int timeoutHours;

    /**
     * Creates an active DB session and writes the HTTP-only cookie to the response.
     */
    @Transactional
    public AuthSession createSession(Owner owner, HttpServletRequest request, HttpServletResponse response) {
        String token = generateToken();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusHours(timeoutHours);

        String ipAddress = extractClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        AuthSession session = AuthSession.builder()
                .owner(owner)
                .sessionToken(token)
                .ipAddress(ipAddress)
                .userAgent(userAgent != null && userAgent.length() > 255 ? userAgent.substring(0, 255) : userAgent)
                .expiresAt(expiresAt)
                .isActive(true)
                .build();

        authSessionRepository.save(session);

        // Attach HTTP-Only cookie
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(false) // Set to true in HTTPS production environments
                .path("/")
                .maxAge(Duration.ofHours(timeoutHours))
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return session;
    }

    /**
     * Validates session token and returns active session if valid and not expired.
     */
    @Transactional(readOnly = true)
    public Optional<AuthSession> validateSession(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        return authSessionRepository.findBySessionTokenAndIsActiveTrue(token)
                .filter(session -> session.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    /**
     * Terminates session and clears cookie.
     */
    @Transactional
    public void terminateSession(String token, HttpServletResponse response) {
        if (token != null && !token.isBlank()) {
            authSessionRepository.findBySessionTokenAndIsActiveTrue(token).ifPresent(s -> {
                s.setIsActive(false);
                authSessionRepository.save(s);
            });
        }

        // Clear cookie
        ResponseCookie clearCookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());
    }

    public String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String generateToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
