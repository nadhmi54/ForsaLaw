package com.forsalaw.userManagement.controller;

import com.forsalaw.userManagement.model.UpdateUserRequest;
import com.forsalaw.userManagement.model.UserDTO;
import com.forsalaw.userManagement.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(Authentication authentication) {
        String email = authentication.getName();
        UserDTO user = userService.getByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMe(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        String email = authentication.getName();
        UserDTO user = userService.updateProfile(email, request);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(Authentication authentication) {
        String email = authentication.getName();
        userService.deactivateMyAccount(email);
        return ResponseEntity.noContent().build();
    }
}
