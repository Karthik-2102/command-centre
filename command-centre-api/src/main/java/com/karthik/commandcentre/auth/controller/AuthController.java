package com.karthik.commandcentre.auth.controller;

import com.karthik.commandcentre.auth.dto.*;
import com.karthik.commandcentre.auth.service.AuthService;
import com.karthik.commandcentre.auth.service.SessionService;
import com.karthik.commandcentre.common.dto.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Step 1: Validate Email.
     * Checks if email matches registered owner.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> checkEmail(@Valid @RequestBody EmailCheckRequest request) {
        AuthResponse response = authService.validateEmail(request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    /**
     * Regenerate and dispatch dynamic password via email.
     */
    @PostMapping("/generate-password")
    public ResponseEntity<ApiResponse<AuthResponse>> generatePassword(@Valid @RequestBody EmailCheckRequest request) {
        AuthResponse response = authService.generateDynamicPassword(request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    /**
     * Step 2: Verify Password.
     * Validates owner password and triggers 2FA OTP generation and delivery via email.
     */
    @PostMapping("/verify-password")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyPassword(
            @Valid @RequestBody PasswordVerifyRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.verifyPassword(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    /**
     * Step 3: Verify OTP.
     * Validates 6-digit OTP, creates active session, and sets HTTP-only cookie.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        AuthResponse response = authService.verifyOtp(request, httpRequest, httpResponse);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    /**
     * Resend OTP.
     * Issues fresh OTP code to registered email subject to 60-second cooldown.
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        AuthResponse response = authService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    /**
     * Logout.
     * Deactivates session in database and clears HTTP-only session cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        String token = extractToken(request);
        authService.logout(token, response);
        return ResponseEntity.ok(ApiResponse.success("Successfully logged out."));
    }

    /**
     * Get Current Authenticated Owner Profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<OwnerDto>> getCurrentOwner(HttpServletRequest request) {
        String token = extractToken(request);
        OwnerDto ownerDto = authService.getOwnerFromSession(token);
        return ResponseEntity.ok(ApiResponse.success("Authenticated owner profile retrieved.", ownerDto));
    }

    /**
     * Change Master Password.
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest) {
        String token = extractToken(httpRequest);
        authService.changePassword(token, request);
        return ResponseEntity.ok(ApiResponse.success("Master password updated successfully."));
    }

    private String extractToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (SessionService.COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        return null;
    }
}
