package com.mkdh.vendorbridge.services;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.userdetails.UserDetails;

public interface AuthenticationService {

    UserDetails authenticate(String usernameOrEmail, String password);

    void generateToken(UserDetails userDetails, HttpServletResponse response);

    UserDetails validateToken(String token);

    String getTokenFromCookie(HttpServletRequest request);

    void removeTokenFromCookie(HttpServletResponse response);

    void generateRefreshToken(UserDetails userDetails);

    UserDetails validateRefreshToken(String refreshToken);
}
