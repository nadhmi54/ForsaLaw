package com.forsalaw.userManagement.controller;

import com.forsalaw.userManagement.model.AdminUpdateUserRequest;
import com.forsalaw.userManagement.model.UserDTO;
import com.forsalaw.userManagement.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private static final List<String> ALLOWED_SORT_FIELDS = List.of(
            "id", "nom", "prenom", "email", "dateCreation", "dateMiseAJour", "roleUser", "actif"
    );

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserDTO>> listUsers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "dateCreation", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Pageable safePageable = toSafePageable(pageable);
        Page<UserDTO> page = userService.findAll(safePageable, search);
        return ResponseEntity.ok(page);
    }

    private Pageable toSafePageable(Pageable pageable) {
        List<Sort.Order> orders = new ArrayList<>();
        for (Sort.Order order : pageable.getSort()) {
            if (ALLOWED_SORT_FIELDS.contains(order.getProperty())) {
                orders.add(order);
            }
        }
        if (orders.isEmpty()) {
            orders.add(new Sort.Order(Sort.Direction.DESC, "dateCreation"));
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        UserDTO user = userService.updateByAdmin(id, request);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/by-email")
    public ResponseEntity<Void> deleteUserByEmail(@RequestParam String email) {
        userService.deactivateByAdminEmail(email);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deactivateByAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/by-email/reactivate")
    public ResponseEntity<Void> reactivateUserByEmail(@RequestParam String email) {
        userService.reactivateByAdminEmail(email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivateUser(@PathVariable Long id) {
        userService.reactivateByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
