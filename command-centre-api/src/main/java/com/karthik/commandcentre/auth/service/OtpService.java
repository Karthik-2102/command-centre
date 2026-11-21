package com.karthik.commandcentre.auth.service;

import com.karthik.commandcentre.auth.entity.OtpVerification;
import com.karthik.commandcentre.auth.entity.Owner;
import com.karthik.commandcentre.auth.repository.OtpVerificationRepository;
import com.karthik.commandcentre.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpVerificationRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.expiry-minutes:5}")
    private int expiryMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    private static final int RESEND_COOLDOWN_SECONDS = 60;

    /**
     * Creates, stores hashed OTP and sends it via email.
     */
    @Transactional
    public OtpGenerationResult createAndSendOtp(Owner owner, String purpose) {
        // Invalidate any active OTPs for this owner
        otpVerificationRepository.invalidateAllByOwnerId(owner.getId());

        String rawOtp = generateSecureOtp();
        String hashedOtp = hashOtp(rawOtp);
        String tempToken = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(expiryMinutes);

        OtpVerification verification = OtpVerification.builder()
                .owner(owner)
                .tempToken(tempToken)
                .otpHash(hashedOtp)
                .purpose(purpose)
                .attemptCount(0)
                .isUsed(false)
                .expiresAt(expiresAt)
                .build();

        otpVerificationRepository.save(verification);

        // Send email
        emailService.sendOtpEmail(owner.getEmail(), rawOtp, expiryMinutes);

        return new OtpGenerationResult(tempToken, expiryMinutes * 60, RESEND_COOLDOWN_SECONDS, rawOtp);
    }

    /**
     * Resends a new OTP for an ongoing session identified by tempToken, subject to cooldown.
     */
    @Transactional
    public OtpGenerationResult resendOtp(String tempToken) {
        OtpVerification lastOtp = otpVerificationRepository
                .findTopByTempTokenAndIsUsedFalseOrderByCreatedAtDesc(tempToken)
                .orElseThrow(() -> ApiException.badRequest("No pending verification found. Please restart login."));

        LocalDateTime now = LocalDateTime.now();
        Duration elapsed = Duration.between(lastOtp.getCreatedAt(), now);
        if (elapsed.getSeconds() < RESEND_COOLDOWN_SECONDS) {
            long remaining = RESEND_COOLDOWN_SECONDS - elapsed.getSeconds();
            throw ApiException.badRequest("Please wait " + remaining + " seconds before requesting a new code.");
        }

        Owner owner = lastOtp.getOwner();
        return createAndSendOtp(owner, lastOtp.getPurpose());
    }

    /**
     * Validates the provided OTP.
     */
    @Transactional
    public Owner verifyOtp(String tempToken, String rawOtp) {
        OtpVerification verification = otpVerificationRepository
                .findTopByTempTokenAndIsUsedFalseOrderByCreatedAtDesc(tempToken)
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired session. Please start login again."));

        LocalDateTime now = LocalDateTime.now();

        // Check if expired
        if (verification.getExpiresAt().isBefore(now)) {
            verification.setIsUsed(true);
            otpVerificationRepository.save(verification);
            throw ApiException.badRequest("Verification code has expired. Please request a new one.");
        }

        // Check attempt limit
        if (verification.getAttemptCount() >= maxAttempts) {
            verification.setIsUsed(true);
            otpVerificationRepository.save(verification);
            throw ApiException.badRequest("Maximum attempts exceeded. This code is invalidated. Please login again.");
        }

        // Increment attempt count
        verification.setAttemptCount(verification.getAttemptCount() + 1);

        String enteredHash = hashOtp(rawOtp);
        if (!MessageDigest.isEqual(verification.getOtpHash().getBytes(StandardCharsets.UTF_8),
                                  enteredHash.getBytes(StandardCharsets.UTF_8))) {
            otpVerificationRepository.save(verification);
            int remaining = maxAttempts - verification.getAttemptCount();
            if (remaining <= 0) {
                verification.setIsUsed(true);
                otpVerificationRepository.save(verification);
                throw ApiException.badRequest("Incorrect code. Maximum attempts reached. Code invalidated.");
            }
            throw ApiException.badRequest("Incorrect verification code. " + remaining + " attempt(s) remaining.");
        }

        // Successfully verified: mark as used
        verification.setIsUsed(true);
        otpVerificationRepository.save(verification);

        return verification.getOwner();
    }

    private String generateSecureOtp() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }

    private String hashOtp(String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(otp.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    public record OtpGenerationResult(String tempToken, int expiresInSeconds, int resendCooldownSeconds, String rawOtp) {}
}
