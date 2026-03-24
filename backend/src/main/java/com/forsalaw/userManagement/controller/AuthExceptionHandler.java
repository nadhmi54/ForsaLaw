package com.forsalaw.userManagement.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleAuthError(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationError(MethodArgumentNotValidException e) {
        List<Map<String, String>> errors = e.getBindingResult().getFieldErrors().stream()
                .map(err -> Map.<String, String>of(
                        "champ", err.getField(),
                        "message", err.getDefaultMessage() != null ? err.getDefaultMessage() : "Valeur invalide"
                ))
                .collect(Collectors.toList());
        String firstMessage = errors.isEmpty() ? "Données invalides" : errors.get(0).get("message");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", firstMessage,
                "errors", errors
        ));
    }
}
