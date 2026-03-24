package com.forsalaw.reclamationManagement.controller;

import com.forsalaw.reclamationManagement.entity.StatutReclamation;
import com.forsalaw.reclamationManagement.model.*;
import com.forsalaw.reclamationManagement.service.ReclamationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reclamations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ReclamationController {

    private final ReclamationService reclamationService;

    @Operation(summary = "Créer une réclamation", description = "Soumission d'une plainte.")
    @PostMapping
    public ResponseEntity<ReclamationDTO> creer(Authentication authentication, 
                                               @Valid @RequestBody CreateReclamationRequest request) {
        return ResponseEntity.ok(reclamationService.creerReclamation(authentication.getName(), request));
    }

    @Operation(summary = "Liste de mes réclamations")
    @GetMapping
    public ResponseEntity<Page<ReclamationDTO>> listerMes(
            Authentication authentication,
            @RequestParam(required = false) StatutReclamation statut,
            @PageableDefault(size = 20, sort = "dateModification", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(reclamationService.listerMesReclamations(authentication.getName(), statut, pageable));
    }

    @Operation(summary = "Détail d'une réclamation")
    @GetMapping("/{id}")
    public ResponseEntity<ReclamationDTO> getDetail(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(reclamationService.getDetailReclamation(authentication.getName(), id));
    }

    @Operation(summary = "Ajouter un message")
    @PostMapping("/{id}/messages")
    public ResponseEntity<ReclamationMessageDTO> ajouterMessage(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody MessageRequest request
    ) {
        return ResponseEntity.ok(reclamationService.ajouterMessage(authentication.getName(), id, request.getContenu()));
    }

    @Operation(summary = "Timeline des messages")
    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ReclamationMessageDTO>> getMessages(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(reclamationService.getMessages(authentication.getName(), id));
    }
}
