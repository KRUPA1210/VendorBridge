package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.CreateUserRequest;
import com.mkdh.vendorbridge.domain.LoginRequest;
import com.mkdh.vendorbridge.domain.dtos.*;
import com.mkdh.vendorbridge.domain.entities.User;
import com.mkdh.vendorbridge.mappers.UserMapper;
import com.mkdh.vendorbridge.security.VendorBridgeUserDetails;
import com.mkdh.vendorbridge.services.AuthenticationService;
import com.mkdh.vendorbridge.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserMapper userMapper;
    private final UserService userService;
    private final AuthenticationService authenticationService;

    // POST /api/v1/auth/create
    @PostMapping(path = "/create")
    public ResponseEntity<CreateUserResponseDto> createUser(
            @Valid @RequestBody CreateUserRequestDto createUserRequestDto) {
        CreateUserRequest createUserRequest = userMapper.toCreateUserRequest(createUserRequestDto);
        User createdUser = userService.createUser(createUserRequest);
        CreateUserResponseDto createUserResponseDto = userMapper.toDto(createdUser);
        return new ResponseEntity<>(createUserResponseDto, HttpStatus.CREATED);
    }

    // POST /api/v1/auth/login
    @PostMapping(path = "/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest loginRequest,
            HttpServletResponse response) {
        AuthResponse authResponse = userService.login(loginRequest, response);
        return ResponseEntity.ok(authResponse);
    }

    // POST /api/v1/auth/verify-user
    @PostMapping(path = "/verify-user")
    public ResponseEntity<Map<String, String>> verifyUser(
            @Valid @RequestBody VerifyUserDto verifyUserDto) {
        userService.verifyUser(verifyUserDto);
        return ResponseEntity.ok(Map.of("message", "Account verified successfully"));
    }

    // POST /api/v1/auth/refresh
    @PostMapping(path = "/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @RequestBody Map<String, String> body,
            HttpServletResponse response) {
        String refreshToken = body.get("refreshToken");
        UserDetails userDetails = authenticationService.validateRefreshToken(refreshToken);
        authenticationService.generateToken(userDetails, response);
        return ResponseEntity.ok(AuthResponse.builder()
                .message("Token refreshed successfully")
                .expiresIn(System.currentTimeMillis() + 86400000)
                .build());
    }

    // POST /api/v1/auth/forgot-password
    @PostMapping(path = "/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        userService.forgotPassword(email);
        return ResponseEntity.ok(Map.of("message", "Password reset email sent successfully"));
    }

    // POST /api/v1/auth/reset-password
    @PostMapping(path = "/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody Map<String, String> body) {
        String resetToken = body.get("resetToken");
        String newPassword = body.get("newPassword");
        userService.resetPassword(resetToken, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    // POST /api/v1/auth/change-password  (requires authentication)
    @PostMapping(path = "/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        UUID userId = userDetails.getId();
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        userService.changePassword(userId, currentPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // POST /api/v1/auth/logout  (requires authentication)
    @PostMapping(path = "/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        authenticationService.removeTokenFromCookie(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}