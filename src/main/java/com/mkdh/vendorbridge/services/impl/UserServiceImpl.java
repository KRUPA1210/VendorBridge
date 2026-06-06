package com.mkdh.vendorbridge.services.impl;

import com.mkdh.vendorbridge.Utils.EmailUtils;
import com.mkdh.vendorbridge.domain.CreateUserRequest;
import com.mkdh.vendorbridge.domain.LoginRequest;
import com.mkdh.vendorbridge.domain.dtos.AuthResponse;
import com.mkdh.vendorbridge.domain.dtos.VerifyUserDto;
import com.mkdh.vendorbridge.domain.entities.User;
import com.mkdh.vendorbridge.domain.entities.UserRole;
import com.mkdh.vendorbridge.exceptions.UserNotFoundException;
import com.mkdh.vendorbridge.repositories.UserRepository;
import com.mkdh.vendorbridge.services.AuthenticationService;
import com.mkdh.vendorbridge.services.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    @Value("${email.from}")
    private String from;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailUtils emailUtils;
    private final AuthenticationService authenticationService;

    @Override
    public User createUser(CreateUserRequest createUserRequest) {

        if (userRepository.existsByEmail(createUserRequest.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        if (userRepository.existsByUserName(createUserRequest.getUserName())) {
            throw new RuntimeException("Username already registered");
        }

        //New User Creation
        User user = new User();

        //Verification code and expiry created
        var verifyCode = generateVerifyCode();
        var verifyCodeExpiry = Instant.now().plusSeconds(86_400);

        user.setUserName(createUserRequest.getUserName());
        user.setEmail(createUserRequest.getEmail());
        user.setPassword(passwordEncoder.encode(createUserRequest.getPassword()));
        user.setPhoneNo("0000000000");
        user.setCountry("IN");
        user.setIsVerified(false);
        user.getRoles().add(UserRole.USER);

        user.setVerifyCode(verifyCode);
        user.setVerifyCodeExpiry(verifyCodeExpiry);

        User savedUser = userRepository.save(user);

        final String to = createUserRequest.getEmail();
        final String subject = "Verify your account";
        final String htmlBody = """
                <h1>Please verify your account</h1>
                <br/>
                <p>Your verification code is: <strong>%s</strong></p>
                <br/><br/>
                *** This is an automated email, please do not reply ***
                """.formatted(verifyCode);

        emailUtils.sendEmail(from, to, subject, htmlBody);

        return savedUser;
    }

    @Override
    public void verifyUser(VerifyUserDto verifyUserDto) {
        User user = userRepository.findByEmail(verifyUserDto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid Email"));

        if (user.getVerifyCode() == null) {
            throw new IllegalStateException("Account is already verified");
        }

        if (!user.getVerifyCode().equals(verifyUserDto.getVerifyCode())) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        if (user.getVerifyCodeExpiry().isBefore(Instant.now())) {
            throw new IllegalStateException("Verification code has expired");
        }

        user.setIsVerified(true);
        user.setVerifyCode(null);
        user.setVerifyCodeExpiry(null);
        userRepository.save(user);
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest, HttpServletResponse response) {
        User user = userRepository.findByUserNameOrEmail(loginRequest.getUsernameOrEmail(), loginRequest.getUsernameOrEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        log.info("User found");

        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            throw new RuntimeException("Please verify your account");
        }
        log.info("User is verified");

        UserDetails userDetails = authenticationService.authenticate(
                loginRequest.getUsernameOrEmail(),
                loginRequest.getPassword()
        );

        // Generate Access Token
        authenticationService.generateToken(userDetails, response);

        // Generate Refresh Token
        authenticationService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .message("Login Successful")
                .expiresIn(System.currentTimeMillis() + 86400000)
                .build();
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with this email not found"));

        // Generate reset token (6-digit code)
        String resetToken = generateVerifyCode();
        Instant resetTokenExpiry = Instant.now().plusSeconds(3600); // 1 hour expiry

        user.setResetPasswordToken(resetToken);
        user.setResetPasswordTokenExpiry(resetTokenExpiry);
        userRepository.save(user);

        // Send email
        final String subject = "Password Reset Request";
        final String htmlBody = """
                <h1>Password Reset Request</h1>
                <br/>
                <p>You have requested to reset your password.</p>
                <p>Your password reset code is: <strong>%s</strong></p>
                <p>This code will expire in 1 hour.</p>
                <br/>
                <p>If you did not request this, please ignore this email.</p>
                <br/><br/>
                *** This is an automated email, please do not reply ***
                """.formatted(resetToken);

        emailUtils.sendEmail(from, email, subject, htmlBody);

        log.info("Password reset email sent to: {}", email);
    }

    @Override
    @Transactional
    public void resetPassword(String resetToken, String newPassword) {
        User user = userRepository.findByResetPasswordToken(resetToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        if (user.getResetPasswordTokenExpiry().isBefore(Instant.now())) {
            throw new IllegalStateException("Reset token has expired");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));

        // Clear reset token
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);

        userRepository.save(user);

        log.info("Password reset successful for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Update to new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", user.getEmail());
    }

    private String generateVerifyCode() {
        int min = 100000;
        int max = 999999;

        int verifyCode = ThreadLocalRandom.current().nextInt(min, max + 1);
        return String.valueOf(verifyCode);
    }
}
