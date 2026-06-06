package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.CreateUserRequest;
import com.mkdh.vendorbridge.domain.dtos.CreateUserRequestDto;
import com.mkdh.vendorbridge.domain.dtos.CreateUserResponseDto;
import com.mkdh.vendorbridge.domain.entities.User;
import com.mkdh.vendorbridge.mappers.UserMapper;
import com.mkdh.vendorbridge.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserMapper userMapper;
    private final UserService userService;

    //Create new user
    @PostMapping(path = "/create")
    public ResponseEntity<CreateUserResponseDto> createUser(
            @Valid @RequestBody CreateUserRequestDto createUserRequestDto) {
        CreateUserRequest createUserRequest = userMapper.toCreateUserRequest(createUserRequestDto);

        User createdUser = userService.createUser(createUserRequest);
        CreateUserResponseDto createUserResponseDto = userMapper.toDto(createdUser);
        return new ResponseEntity<>(createUserResponseDto, HttpStatus.CREATED);
    }
}
