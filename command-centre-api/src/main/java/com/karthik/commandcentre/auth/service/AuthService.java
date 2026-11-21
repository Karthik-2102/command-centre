package com.karthik.commandcentre.auth.service;

import com.karthik.commandcentre.auth.dto.*;
import com.karthik.commandcentre.auth.entity.AuthSession;
import com.karthik.commandcentre.auth.entity.LoginAttempt;
import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.LoginAttemptRepository;
import com.karthik.commandcentre.auth.repository.OwnerRepository;
import com.karthik.commandcentre.common.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final OwnerRepository ownerRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final SessionService sessionService;
    private final EmailService emailService;
    private final java.security.SecureRandom secureRandom = new java.security.SecureRandom();

    @Value("${app.owner.email:karthikvikash02@gmail.com}")
    private String allowedOwnerEmail;

    @Value("${app.owner.password:CommandCentre@2024}")
    private String configuredOwnerPassword;

    @Value("${app.owner.name:Karthik}")
    private String configuredOwnerName;

    /**
     * Step 1: Owner Email Check.
     * Strictly verifies that the email corresponds to the configured owner.
     */
    public AuthResponse validateEmail(EmailCheckRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (!normalizedEmail.equalsIgnoreCase(allowedOwnerEmail.trim())) {
            log.warn("Access attempt with unauthorized email: {}", normalizedEmail);
            throw ApiException
                    .forbidden("Access denied: Private command centre. Only the predefined owner may sign in.");
        }

        boolean existsInDb = ownerRepository.existsByEmail(normalizedEmail);
        if (!existsInDb) {
            java.util.List<Owner> existingOwners = ownerRepository.findAll();
            if (!existingOwners.isEmpty()) {
                Owner existing = existingOwners.get(0);
                log.info("Migrating owner from '{}' to configured real email: {}", existing.getEmail(),
                        normalizedEmail);
                existing.setEmail(normalizedEmail);
                existing.setName(configuredOwnerName);
                if (configuredOwnerPassword != null && !configuredOwnerPassword.isBlank()) {
                    existing.setPasswordHash(passwordEncoder.encode(configuredOwnerPassword));
                }
                ownerRepository.save(existing);
            } else {
                log.info("Auto-initializing owner account on first login for: {}", normalizedEmail);
                Owner owner = Owner.builder()
                        .email(normalizedEmail)
                        .name(configuredOwnerName)
                        .passwordHash(passwordEncoder
                                .encode(configuredOwnerPassword != null && !configuredOwnerPassword.isBlank()
                                        ? configuredOwnerPassword
                                        : "CommandCentre@2024"))
                        .build();
                ownerRepository.save(owner);
                log.info("Owner account created successfully for: {}", normalizedEmail);
            }
        }

        Owner owner = ownerRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> ApiException.unauthorized("Owner profile not found."));

        // Generate dynamic password (10 characters, diverse names/alphabets, symbols, digits)
        String dynamicPassword = generateDynamicPasswordValue();
        owner.setDynamicPasswordHash(passwordEncoder.encode(dynamicPassword));
        owner.setDynamicPasswordExpiry(LocalDateTime.now().plusMinutes(3));
        ownerRepository.save(owner);

        // Dispatch dynamic password to registered Gmail via Resend (valid for 3 minutes)
        emailService.sendDynamicPasswordEmail(normalizedEmail, dynamicPassword, 3);

        return AuthResponse.builder()
                .step("PASSWORD_REQUIRED")
                .message("Dynamic 10-character login password (valid for 3 mins) dispatched to " + normalizedEmail + ".")
                .build();
    }

    /**
     * Regenerates and dispatches a fresh dynamic password (valid for 3 minutes).
     */
    @Transactional
    public AuthResponse generateDynamicPassword(EmailCheckRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (!normalizedEmail.equalsIgnoreCase(allowedOwnerEmail.trim())) {
            throw ApiException.forbidden("Access denied: Unauthorized identity.");
        }

        Owner owner = ownerRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> ApiException.unauthorized("Owner profile not found."));

        String dynamicPassword = generateDynamicPasswordValue();
        owner.setDynamicPasswordHash(passwordEncoder.encode(dynamicPassword));
        owner.setDynamicPasswordExpiry(LocalDateTime.now().plusMinutes(3));
        ownerRepository.save(owner);

        emailService.sendDynamicPasswordEmail(normalizedEmail, dynamicPassword, 3);

        return AuthResponse.builder()
                .step("PASSWORD_REQUIRED")
                .message("New 10-character dynamic password dispatched to " + normalizedEmail + "! (Valid for 3 mins)")
                .build();
    }

    private static final java.util.List<String> DYNAMIC_BASE_NAMES = java.util.List.of(
            "Vikash", "Karthik", "Vrsyer", "Nexus", "Cyber", "Titan", "Falcon", "Apex", "Quantum", "Shadow", "Torval", "Zelph"
    );
    private static final String SPECIAL_SYMBOLS = "@#$%&!";
    private static final String LOWER_LETTERS = "abcdefghijklmnopqrstuvwxyz";
    private static final String UPPER_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String DIGIT_CHARS = "0123456789";

    /**
     * Generates a 10-character dynamic password using diverse names, random alphabets, symbols & digits.
     * Examples: Vrsye@2589, Vikash@#02, Karthik@12, Titan#9201.
     */
    private String generateDynamicPasswordValue() {
        StringBuilder sb = new StringBuilder();

        // 50% curated names/syllables, 50% random letters
        boolean useCurated = secureRandom.nextBoolean();
        String prefix;
        if (useCurated) {
            prefix = DYNAMIC_BASE_NAMES.get(secureRandom.nextInt(DYNAMIC_BASE_NAMES.size()));
        } else {
            int len = 5 + secureRandom.nextInt(2); // 5 or 6 letters
            StringBuilder letters = new StringBuilder();
            letters.append(UPPER_LETTERS.charAt(secureRandom.nextInt(UPPER_LETTERS.length())));
            for (int i = 1; i < len; i++) {
                letters.append(LOWER_LETTERS.charAt(secureRandom.nextInt(LOWER_LETTERS.length())));
            }
            prefix = letters.toString();
        }

        sb.append(prefix);

        // Add 1 or 2 special characters
        int numSymbols = (sb.length() >= 7) ? 1 : (1 + secureRandom.nextInt(2));
        for (int i = 0; i < numSymbols; i++) {
            sb.append(SPECIAL_SYMBOLS.charAt(secureRandom.nextInt(SPECIAL_SYMBOLS.length())));
        }

        // Fill remainder with digits to make exactly 10 characters
        while (sb.length() < 10) {
            sb.append(DIGIT_CHARS.charAt(secureRandom.nextInt(DIGIT_CHARS.length())));
        }

        // Guarantee exactly 10 characters
        if (sb.length() > 10) {
            return sb.substring(0, 10);
        }

        return sb.toString();
    }

    /**
     * Step 2: Password Verification.
     * Verifies owner dynamic password (or master password fallback), initiates OTP generation & delivery.
     */
    @Transactional
    public AuthResponse verifyPassword(PasswordVerifyRequest request, HttpServletRequest httpRequest) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String clientIp = sessionService.extractClientIp(httpRequest);

        // Security check: must match owner email
        if (!normalizedEmail.equalsIgnoreCase(allowedOwnerEmail.trim())) {
            recordLoginAttempt(normalizedEmail, clientIp, false, "Unauthorized email attempt");
            throw ApiException.forbidden("Access denied: Unauthorized identity.");
        }

        Owner owner = ownerRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> ApiException.unauthorized("Authentication failed."));

        String submittedPassword = request.getPassword() != null ? request.getPassword().trim() : "";

        // Check if matches dynamic password (valid for 10 minutes)
        boolean matchesDynamic = owner.getDynamicPasswordHash() != null
                && owner.getDynamicPasswordExpiry() != null
                && LocalDateTime.now().isBefore(owner.getDynamicPasswordExpiry())
                && passwordEncoder.matches(submittedPassword, owner.getDynamicPasswordHash());

        // Check if matches permanent password (fallback)
        boolean matchesPermanent = owner.getPasswordHash() != null
                && passwordEncoder.matches(submittedPassword, owner.getPasswordHash());

        if (!matchesDynamic && !matchesPermanent) {
            recordLoginAttempt(normalizedEmail, clientIp, false, "Incorrect password");
            throw ApiException.unauthorized("Incorrect password. Please enter the dynamic password sent to your Gmail.");
        }

        // On successful match, clear the dynamic password
        owner.setDynamicPasswordHash(null);
        owner.setDynamicPasswordExpiry(null);
        ownerRepository.save(owner);

        // Record successful password authentication
        recordLoginAttempt(normalizedEmail, clientIp, true, null);

        // Generate and send 2FA OTP via email
        OtpService.OtpGenerationResult otpResult = otpService.createAndSendOtp(owner, "LOGIN");

        String dispatchMsg = "Password verified! 2FA security code dispatched to your registered Gmail.";

        return AuthResponse.builder()
                .step("OTP_REQUIRED")
                .tempToken(otpResult.tempToken())
                .expiresInSeconds(otpResult.expiresInSeconds())
                .resendCooldownSeconds(otpResult.resendCooldownSeconds())
                .message(dispatchMsg)
                .build();
    }

    /**
     * Step 3: OTP Verification.
     * Verifies 6-digit OTP, establishes authenticated session with HTTP-only
     * cookie.
     */
    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request, HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        Owner owner = otpService.verifyOtp(request.getTempToken(), request.getOtp());

        // Create secure session
        AuthSession session = sessionService.createSession(owner, httpRequest, httpResponse);

        OwnerDto ownerDto = OwnerDto.builder()
                .id(owner.getId())
                .name(owner.getName())
                .email(owner.getEmail())
                .build();

        return AuthResponse.builder()
                .step("AUTHENTICATED")
                .sessionToken(session.getSessionToken())
                .owner(ownerDto)
                .message("Two-factor authentication successful. Welcome back, " + owner.getName() + "!")
                .build();
    }

    /**
     * Resend OTP subject to cooldown.
     */
    @Transactional
    public AuthResponse resendOtp(ResendOtpRequest request) {
        OtpService.OtpGenerationResult otpResult = otpService.resendOtp(request.getTempToken());

        String dispatchMsg = "A fresh verification code has been dispatched to your email.";

        return AuthResponse.builder()
                .step("OTP_REQUIRED")
                .tempToken(otpResult.tempToken())
                .expiresInSeconds(otpResult.expiresInSeconds())
                .resendCooldownSeconds(otpResult.resendCooldownSeconds())
                .message(dispatchMsg)
                .build();
    }

    /**
     * Terminate session and invalidate cookie.
     */
    @Transactional
    public void logout(String sessionToken, HttpServletResponse httpResponse) {
        sessionService.terminateSession(sessionToken, httpResponse);
    }

    /**
     * Retrieve the currently authenticated owner.
     */
    @Transactional(readOnly = true)
    public OwnerDto getOwnerFromSession(String sessionToken) {
        return sessionService.validateSession(sessionToken)
                .map(session -> {
                    Owner owner = session.getOwner();
                    return OwnerDto.builder()
                            .id(owner.getId())
                            .name(owner.getName())
                            .email(owner.getEmail())
                            .build();
                })
                .orElseThrow(() -> ApiException.unauthorized("Active session not found or has expired."));
    }

    /**
     * Change master password securely after verifying current password.
     */
    @Transactional
    public void changePassword(String sessionToken, ChangePasswordRequest request) {
        AuthSession session = sessionService.validateSession(sessionToken)
                .orElseThrow(() -> ApiException.unauthorized("Authentication required to update password."));

        Owner owner = session.getOwner();
        if (!passwordEncoder.matches(request.getCurrentPassword(), owner.getPasswordHash())) {
            throw ApiException.badRequest("Current password is incorrect.");
        }

        owner.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        ownerRepository.save(owner);
    }

    private void recordLoginAttempt(String email, String ip, boolean success, String reason) {
        LoginAttempt attempt = LoginAttempt.builder()
                .email(email)
                .ipAddress(ip)
                .successful(success)
                .failureReason(reason)
                .attemptedAt(LocalDateTime.now())
                .build();
        loginAttemptRepository.save(attempt);
    }
}
