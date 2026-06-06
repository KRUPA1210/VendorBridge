package com.mkdh.vendorbridge.mappers;

import com.mkdh.vendorbridge.domain.CreateUserRequest;
import com.mkdh.vendorbridge.domain.dtos.CreateUserRequestDto;
import com.mkdh.vendorbridge.domain.dtos.CreateUserResponseDto;
import com.mkdh.vendorbridge.domain.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    CreateUserRequest toCreateUserRequest(CreateUserRequestDto createUserRequestDto);

    CreateUserResponseDto toDto(User user);
}