package com.karthik.commandcentre.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String step;             // "EMAIL_VERIFIED", "OTP_REQUIRED", "AUTHENTICATED"
    private String tempToken;
    private String sessionToken;
    private Integer expiresInSeconds;
    private Integer resendCooldownSeconds;
    private OwnerDto owner;
    private String message;
}
