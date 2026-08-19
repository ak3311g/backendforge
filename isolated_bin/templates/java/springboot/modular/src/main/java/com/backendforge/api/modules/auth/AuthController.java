package com.backendforge.api.modules.auth;

import com.backendforge.api.modules.auth.dto.AuthResponse;
import com.backendforge.api.modules.auth.dto.LoginRequest;
import com.backendforge.api.modules.auth.dto.RegisterRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName() != null ? user.getName() : ""
        )));
    }
}