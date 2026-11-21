package com.karthik.commandcentre.auth.filter;

import com.karthik.commandcentre.auth.entity.AuthSession;
import com.karthik.commandcentre.auth.service.SessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SessionAuthFilter extends OncePerRequestFilter {

    private final SessionService sessionService;

    @Value("${app.owner.email:karthikvikash02@gmail.com}")
    private String ownerEmail;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/v1/auth/login") ||
               path.startsWith("/api/v1/auth/verify-password") ||
               path.startsWith("/api/v1/auth/verify-otp") ||
               path.startsWith("/api/v1/auth/resend-otp") ||
               path.startsWith("/h2-console");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String sessionToken = resolveSessionToken(request);

        if (sessionToken != null && !sessionToken.isBlank()) {
            Optional<AuthSession> sessionOpt = sessionService.validateSession(sessionToken);

            if (sessionOpt.isPresent()) {
                AuthSession session = sessionOpt.get();
                String principalEmail = (session.getOwner() != null && session.getOwner().getEmail() != null)
                        ? session.getOwner().getEmail()
                        : ownerEmail;
                var authority = new SimpleGrantedAuthority("ROLE_OWNER");
                var authentication = new UsernamePasswordAuthenticationToken(
                        principalEmail,
                        null,
                        Collections.singletonList(authority)
                );
                // Attach session details
                authentication.setDetails(session);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveSessionToken(HttpServletRequest request) {
        // 1. Try resolving from HTTP-only Cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (SessionService.COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // 2. Fallback to Authorization: Bearer <token> header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }

        return null;
    }
}
