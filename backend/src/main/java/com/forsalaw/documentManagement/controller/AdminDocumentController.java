package com.forsalaw.documentManagement.controller;

import com.forsalaw.documentManagement.model.DocumentMetadataDTO;
import com.forsalaw.documentManagement.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints du Coffre-fort Numérique réservés aux administrateurs.
 */
@RestController
@RequestMapping("/api/admin/documents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin - Coffre-fort Numérique", description = "Gestion administrative des documents")
public class AdminDocumentController {

    private final DocumentService documentService;

    @Operation(summary = "Lister tous les documents (Admin)", description = "Retourne la liste paginée de tous les documents non supprimés du système.")
    @GetMapping
    public ResponseEntity<Page<DocumentMetadataDTO>> tousLesDocuments(
            @PageableDefault(size = 20, sort = "dateCreation", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(documentService.tousLesDocuments(pageable));
    }

    @Operation(summary = "Supprimer un document (Admin)", description = "Suppression logique : le document est marqué comme supprimé dans la base de données mais le fichier physique reste sur le disque pour une éventuelle récupération.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerDocument(
            Authentication authentication,
            @PathVariable String id,
            HttpServletRequest request
    ) {
        documentService.supprimerDocument(authentication.getName(), id, request);
        return ResponseEntity.noContent().build();
    }
}
