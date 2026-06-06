package com.mkdh.vendorbridge.services;

import com.mkdh.vendorbridge.domain.CreateUserRequest;
import com.mkdh.vendorbridge.domain.LoginRequest;
import com.mkdh.vendorbridge.domain.dtos.AuthResponse;
import com.mkdh.vendorbridge.domain.dtos.VerifyUserDto;
import com.mkdh.vendorbridge.domain.entities.User;
import jakarta.servlet.http.HttpServletResponse;

import java.util.UUID;

public interface UserService {

    User createUser(CreateUserRequest createUserRequest);

    void verifyUser(VerifyUserDto verifyUserDto);

    AuthResponse login(LoginRequest loginRequest, HttpServletResponse response);

    void forgotPassword(String email);

    void resetPassword(String resetToken, String newPassword);

    void changePassword(UUID userId, String currentPassword, String newpassword);
}
