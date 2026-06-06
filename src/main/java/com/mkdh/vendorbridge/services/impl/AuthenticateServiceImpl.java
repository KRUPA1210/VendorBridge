package com.mkdh.vendorbridge.services.impl;

import com.mkdh.vendorbridge.domain.entities.User;
import com.mkdh.vendorbridge.exceptions.UserNotFoundException;
import com.mkdh.vendorbridge.repositories.UserRepository;
import com.mkdh.vendorbridge.services.AuthenticationService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.WebUtils;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthenticateServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Value(("${jwt.secret}"))
    private String secretKey;

    private final Long jwtExpiryMs = 86400000L; // 24 hour expiry time
    private final Long refreshTokenExpiryMs = 604800000L; // 7 days

    @Override
    public UserDetails authenticate(String usernameOrEmail, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(usernameOrEmail, password)
        );
        return userDetailsService.loadUserByUsername(usernameOrEmail);
    }

    @Override
    public void generateToken(UserDetails userDetails, HttpServletResponse response) {
        Map<String, Object> claims = new HashMap<>();
        // Include roles in token so frontend can do role-based UI safely
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList()));

        String token = Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiryMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60);

        response.addCookie(cookie);
    }

    @Override
    @Transactional
    public void generateRefreshToken(UserDetails userDetails) {
        User user = userRepository.findByUserName(userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList()));

        String token = Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiryMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        user.setRefreshToken(token);
        user.setRefreshTokenExpiry(new Date(System.currentTimeMillis() + refreshTokenExpiryMs));

        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails validateRefreshToken(String refreshToken) {
        String usernameOrEmail = extractUsernameOrEmail(refreshToken);
        return userDetailsService.loadUserByUsername(usernameOrEmail);
    }

    @Override
    public UserDetails validateToken(String token) {
        String usernameOrEmail = extractUsernameOrEmail(token);
        return userDetailsService.loadUserByUsername(usernameOrEmail);
    }

    private String extractUsernameOrEmail(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    @Override
    public String getTokenFromCookie(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, "token");
        if (cookie != null) {
            return cookie.getValue();
        }
        return null;
    }

    @Override
    public void removeTokenFromCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setPath("/");
        cookie.setMaxAge(0);    // Immediately expire the cookie
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        response.addCookie(cookie);
    }

    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
