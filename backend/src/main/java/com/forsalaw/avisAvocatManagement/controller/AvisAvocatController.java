package com.forsalaw.avisAvocatManagement.controller;

import com.forsalaw.avisAvocatManagement.model.AvisAvocatDTO;
import com.forsalaw.avisAvocatManagement.model.CreateAvisRequest;
import com.forsalaw.avisAvocatManagement.service.AvisAvocatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/avocats")
@RequiredArgsConstructor
public class AvisAvocatController {

    private static final List<String> ALLOWED_SORT_FIELDS = List.of("id", "dateCreation", "note");

    private final AvisAvocatService avisAvocatService;

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

    @Operation(summary = "Laisser un avis (note 1-5 + commentaire)", description = "Le client connecté dépose un avis pour l'avocat. Un seul avis par client et par avocat. Note : entier de 1 à 5 (étoiles). Cliquez sur Authorize et entrez le token JWT avant d'exécuter.")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/{avocatId}/avis")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<AvisAvocatDTO> create(
            Authentication authentication,
            @PathVariable String avocatId,
            @Valid @RequestBody CreateAvisRequest request
    ) {
        String email = authentication.getName();
        AvisAvocatDTO avis = avisAvocatService.create(email, avocatId, request);
        return ResponseEntity.ok(avis);
    }

    @Operation(summary = "Liste des avis d'un avocat", description = "Retourne les avis (note + commentaire) pour un avocat, paginés. Accessible sans authentification.")
    @GetMapping("/{avocatId}/avis")
    public ResponseEntity<Page<AvisAvocatDTO>> listByAvocat(
            @PathVariable String avocatId,
            @PageableDefault(size = 20, sort = "dateCreation", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Pageable safe = toSafePageable(pageable);
        Page<AvisAvocatDTO> page = avisAvocatService.findByAvocatId(avocatId, safe);
        return ResponseEntity.ok(page);
    }
}
