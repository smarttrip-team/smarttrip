package com.smarttrip.user.service;

import com.smarttrip.user.dto.*;
import com.smarttrip.user.entity.Role;
import com.smarttrip.user.entity.User;
import com.smarttrip.user.entity.UserProfile;
import com.smarttrip.user.enums.RoleName;
import com.smarttrip.user.enums.UserStatus;
import com.smarttrip.user.exception.BusinessException;
import com.smarttrip.user.exception.ResourceNotFoundException;
import com.smarttrip.user.repository.RoleRepository;
import com.smarttrip.user.repository.UserProfileRepository;
import com.smarttrip.user.repository.UserRepository;
import com.smarttrip.user.security.JwtUtil;
import com.smarttrip.user.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserServiceImpl userService;

    private User sampleUser;
    private Role customerRole;

    @BeforeEach
    void setUp() {
        customerRole = Role.builder()
                .id(1L)
                .name(RoleName.ROLE_CUSTOMER)
                .build();

        UserProfile profile = UserProfile.builder()
                .id(10L)
                .fullName("Nguyen Van A")
                .phone("0901234567")
                .build();

        sampleUser = User.builder()
                .id(1L)
                .email("test@smarttrip.com")
                .passwordHash("encoded_pwd")
                .status(UserStatus.ACTIVE)
                .roles(new HashSet<>(Set.of(customerRole)))
                .profile(profile)
                .createdAt(LocalDateTime.now())
                .build();

        profile.setUser(sampleUser);
    }

    @Test
    void testRegister_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .email("newuser@smarttrip.com")
                .password("Password@123")
                .fullName("New User")
                .phone("0912345678")
                .build();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded_pwd");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(2L);
            return u;
        });
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("mock-jwt-token");

        AuthResponse response = userService.register(request);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals("newuser@smarttrip.com", response.getEmail());
        assertEquals("mock-jwt-token", response.getToken());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegister_DuplicateEmail_ThrowsBusinessException() {
        RegisterRequest request = RegisterRequest.builder()
                .email("test@smarttrip.com")
                .password("Password@123")
                .fullName("Duplicate")
                .build();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(BusinessException.class, () -> userService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = LoginRequest.builder()
                .email("test@smarttrip.com")
                .password("Password@123")
                .build();

        when(userRepository.findByEmail("test@smarttrip.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password@123", "encoded_pwd")).thenReturn(true);
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("mock-jwt-token");

        AuthResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("mock-jwt-token", response.getToken());
    }

    @Test
    void testLogin_InvalidPassword_ThrowsBusinessException() {
        LoginRequest request = LoginRequest.builder()
                .email("test@smarttrip.com")
                .password("WrongPassword")
                .build();

        when(userRepository.findByEmail("test@smarttrip.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", "encoded_pwd")).thenReturn(false);

        assertThrows(BusinessException.class, () -> userService.login(request));
    }

    @Test
    void testLogin_UserBlocked_ThrowsBusinessException() {
        sampleUser.setStatus(UserStatus.BLOCKED);

        LoginRequest request = LoginRequest.builder()
                .email("test@smarttrip.com")
                .password("Password@123")
                .build();

        when(userRepository.findByEmail("test@smarttrip.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password@123", "encoded_pwd")).thenReturn(true);

        assertThrows(BusinessException.class, () -> userService.login(request));
    }

    @Test
    void testGetUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        UserResponse response = userService.getUserById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("test@smarttrip.com", response.getEmail());
        assertEquals("Nguyen Van A", response.getProfile().getFullName());
    }

    @Test
    void testGetUserById_NotFound_ThrowsResourceNotFoundException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(99L));
    }

    @Test
    void testGetUserStatus_Active() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        UserStatusResponse response = userService.getUserStatus(1L);

        assertNotNull(response);
        assertTrue(response.isActive());
        assertEquals("ACTIVE", response.getStatus());
        assertTrue(response.getRoles().contains("ROLE_CUSTOMER"));
    }

    @Test
    void testGetUserStatus_Blocked() {
        sampleUser.setStatus(UserStatus.BLOCKED);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        UserStatusResponse response = userService.getUserStatus(1L);

        assertNotNull(response);
        assertFalse(response.isActive());
        assertEquals("BLOCKED", response.getStatus());
    }

    @Test
    void testVerifyUserRole_MatchesRole() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        boolean verified = userService.verifyUserRole(1L, "ROLE_CUSTOMER");

        assertTrue(verified);
    }

    @Test
    void testVerifyUserRole_DoesNotMatchRole() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        boolean verified = userService.verifyUserRole(1L, "ROLE_HOTEL_MANAGER");

        assertFalse(verified);
    }

    @Test
    void testUpdateUserProfile_Success() {
        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .fullName("Nguyen Van B")
                .phone("0999999999")
                .build();

        when(userProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleUser.getProfile()));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        UserProfileResponse response = userService.updateUserProfile(1L, request);

        assertNotNull(response);
        assertEquals("Nguyen Van B", response.getFullName());
        assertEquals("0999999999", response.getPhone());
    }

    @Test
    void testGetAllUsers_Success() {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser));
        List<UserResponse> list = userService.getAllUsers();
        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("test@smarttrip.com", list.get(0).getEmail());
    }

    @Test
    void testUpdateUserStatus_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.updateUserStatus(1L, "BLOCKED");
        assertNotNull(response);
        assertEquals("BLOCKED", response.getStatus());
    }
}
