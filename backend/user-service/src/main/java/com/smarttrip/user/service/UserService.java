package com.smarttrip.user.service;

import com.smarttrip.user.dto.AuthResponse;
import com.smarttrip.user.dto.LoginRequest;
import com.smarttrip.user.dto.RegisterRequest;
import com.smarttrip.user.dto.UpdateProfileRequest;
import com.smarttrip.user.dto.UserProfileResponse;
import com.smarttrip.user.dto.UserResponse;
import com.smarttrip.user.dto.UserStatusResponse;

import java.util.List;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse getUserById(Long userId);
    UserProfileResponse getUserProfile(Long userId);
    UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request);
    UserStatusResponse getUserStatus(Long userId);
    boolean verifyUserRole(Long userId, String roleName);
    List<UserResponse> getAllUsers();
    UserResponse updateUserStatus(Long userId, String status);
}
