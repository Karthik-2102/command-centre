package com.karthik.commandcentre.auth.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

  @Value("${app.resend.api-key:}")
  private String resendApiKey;

  @Value("${app.resend.from-email:Command Centre <onboarding@resend.dev>}")
  private String fromEmail;

  public boolean isConfigured() {
    return resendApiKey != null && !resendApiKey.isBlank() && !resendApiKey.equals("re_placeholder");
  }

  public void sendOtpEmail(String toEmail, String otp, int expiryMinutes) {
    log.info("Preparing 2FA OTP email for: {}", toEmail);

    String subject = "Command Centre - Step 2: 2FA Verification Code: " + otp;
    String htmlContent = buildOtpHtml(otp, expiryMinutes);

    // Check if API key is real or fallback placeholder
    if (resendApiKey == null || resendApiKey.isBlank() || resendApiKey.equals("re_placeholder")) {
      log.warn("==================================================================");
      log.warn("RESEND API KEY NOT CONFIGURED. MOCK 2FA EMAIL SENT.");
      log.warn("Recipient: {}", toEmail);
      log.warn(">>> YOUR 2FA OTP CODE IS: {} <<<", otp);
      log.warn("Expires in: {} minutes", expiryMinutes);
      log.warn("==================================================================");
      return;
    }

    try {
      Resend resend = new Resend(resendApiKey);
      CreateEmailOptions sendOptions = CreateEmailOptions.builder()
          .from(fromEmail)
          .to(toEmail)
          .subject(subject)
          .html(htmlContent)
          .build();

      CreateEmailResponse response = resend.emails().send(sendOptions);
      log.info("2FA OTP Email sent successfully via Resend. ID: {}", response.getId());
    } catch (Exception e) {
      log.error("Failed to send 2FA OTP email via Resend: {}", e.getMessage(), e);
      log.warn("==================================================================");
      log.warn(">>> YOUR 2FA OTP CODE IS: {} <<<", otp);
      log.warn("Expires in: {} minutes", expiryMinutes);
      log.warn("==================================================================");
    }
  }

  public void sendDynamicPasswordEmail(String toEmail, String dynamicPassword, int expiryMinutes) {
    log.info("Preparing Dynamic Password email for: {}", toEmail);

    String subject = "Command Centre - Step 1: Dynamic Login Password: " + dynamicPassword;
    String htmlContent = buildDynamicPasswordHtml(dynamicPassword, expiryMinutes);

    if (resendApiKey == null || resendApiKey.isBlank() || resendApiKey.equals("re_placeholder")) {
      log.warn("==================================================================");
      log.warn("RESEND API KEY NOT CONFIGURED. MOCK DYNAMIC PASSWORD SENT.");
      log.warn("Recipient: {}", toEmail);
      log.warn(">>> YOUR DYNAMIC PASSWORD IS: {} <<<", dynamicPassword);
      log.warn("Expires in: {} minutes", expiryMinutes);
      log.warn("==================================================================");
      return;
    }

    try {
      Resend resend = new Resend(resendApiKey);
      CreateEmailOptions sendOptions = CreateEmailOptions.builder()
          .from(fromEmail)
          .to(toEmail)
          .subject(subject)
          .html(htmlContent)
          .build();

      CreateEmailResponse response = resend.emails().send(sendOptions);
      log.info("Dynamic Password Email sent successfully via Resend. ID: {}", response.getId());
    } catch (Exception e) {
      log.error("Failed to send Dynamic Password email via Resend: {}", e.getMessage(), e);
      log.warn("==================================================================");
      log.warn(">>> YOUR DYNAMIC PASSWORD IS: {} <<<", dynamicPassword);
      log.warn("Expires in: {} minutes", expiryMinutes);
      log.warn("==================================================================");
    }
  }

  private String buildDynamicPasswordHtml(String password, int expiryMinutes) {
    return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              margin: 0; padding: 0; background-color: #0a0a0f; color: #f3f4f6;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
            .container {
              max-width: 520px; margin: 40px auto; background-color: #111119;
              border: 1px solid #1e1e2e; border-radius: 16px; padding: 36px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            .header { text-align: center; margin-bottom: 24px; }
            .title {
              font-size: 22px; font-weight: 700; color: #a78bfa; letter-spacing: 0.5px;
              margin: 0;
            }
            .subtitle { font-size: 14px; color: #9ca3af; margin-top: 6px; }
            .pwd-box {
              text-align: center; margin: 32px 0; padding: 22px;
              background: rgba(167, 139, 250, 0.08); border: 1px solid rgba(167, 139, 250, 0.3);
              border-radius: 12px;
            }
            .pwd-label {
              font-size: 11px; text-transform: uppercase; letter-spacing: 2px;
              color: #a78bfa; margin-bottom: 8px; font-weight: 600;
            }
            .pwd-code {
              font-family: 'Courier New', Courier, monospace; font-size: 32px;
              font-weight: 800; letter-spacing: 4px; color: #e9d5ff; margin: 0;
            }
            .expiry-note { font-size: 13px; color: #fbbf24; margin-top: 10px; }
            .text { font-size: 14px; color: #d1d5db; line-height: 1.6; }
            .step-badge {
              display: inline-block; padding: 4px 10px; border-radius: 999px;
              background: rgba(167, 139, 250, 0.15); color: #c084fc; font-size: 12px; font-weight: 600;
              margin-bottom: 12px;
            }
            .footer {
              margin-top: 32px; padding-top: 20px; border-top: 1px solid #1e1e2e;
              font-size: 12px; color: #6b7280; text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="step-badge">STEP 1 OF 2 &bull; PASSWORD AUTHENTICATION</span>
              <h1 class="title">Command Centre</h1>
              <p class="subtitle">Dynamic Login Password</p>
            </div>
            <p class="text">Hello Karthik,</p>
            <p class="text">You requested a dynamically generated login password for your Personal Developer Command Centre. Enter this password in the password field:</p>

            <div class="pwd-box">
              <div class="pwd-label">Your 10-Character Dynamic Password</div>
              <div class="pwd-code">%s</div>
              <div class="expiry-note">Valid for %d minutes &bull; Single-Use</div>
            </div>

            <p class="text"><strong>Next Step:</strong> After entering this password, you will be prompted for your 6-digit 2FA verification code sent to this email.</p>

            <div class="footer">
              Personal Developer Command Centre &bull; Private Owner-Only Access
            </div>
          </div>
        </body>
        </html>
        """
        .formatted(password, expiryMinutes);
  }

  private String buildOtpHtml(String otp, int expiryMinutes) {
    return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              margin: 0; padding: 0; background-color: #0a0a0f; color: #f3f4f6;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
            .container {
              max-width: 520px; margin: 40px auto; background-color: #111119;
              border: 1px solid #1e1e2e; border-radius: 16px; padding: 36px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            .header { text-align: center; margin-bottom: 24px; }
            .title {
              font-size: 22px; font-weight: 700; color: #00f0ff; letter-spacing: 0.5px;
              margin: 0;
            }
            .subtitle { font-size: 14px; color: #9ca3af; margin-top: 6px; }
            .otp-box {
              text-align: center; margin: 32px 0; padding: 20px;
              background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2);
              border-radius: 12px;
            }
            .otp-code {
              font-family: 'Courier New', Courier, monospace; font-size: 38px;
              font-weight: 800; letter-spacing: 8px; color: #00f0ff; margin: 0;
            }
            .expiry-note { font-size: 13px; color: #ef4444; margin-top: 10px; }
            .text { font-size: 14px; color: #d1d5db; line-height: 1.6; }
            .footer {
              margin-top: 32px; padding-top: 20px; border-top: 1px solid #1e1e2e;
              font-size: 12px; color: #6b7280; text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">Command Centre</h1>
              <p class="subtitle">Secure Dynamic Login Passcode</p>
            </div>
            <p class="text">Hello Karthik,</p>
            <p class="text">A sign-in request was initiated for your Personal Developer Command Centre. Use this single-use dynamic passcode to complete your sign-in:</p>

            <div class="otp-box">
              <div class="otp-code">%s</div>
              <div class="expiry-note">Expires in %d minutes</div>
            </div>

            <p class="text">If you did not initiate this login request, please verify your credentials and ensure your server environment is secure immediately.</p>

            <div class="footer">
              Personal Developer Command Centre &bull; Private Owner-Only Access
            </div>
          </div>
        </body>
        </html>
        """
        .formatted(otp, expiryMinutes);
  }
}
