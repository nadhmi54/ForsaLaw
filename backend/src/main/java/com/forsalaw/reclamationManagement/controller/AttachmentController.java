package com.forsalaw.reclamationManagement.controller;

import com.forsalaw.reclamationManagement.entity.ReclamationAttachment;
import com.forsalaw.reclamationManagement.service.FileStorageService;
import com.forsalaw.reclamationManagement.service.ReclamationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

import java.io.IOException;
@RestController
@RequestMapping("/api/reclamations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AttachmentController {

    private final FileStorageService fileStorageService;
    private final ReclamationService reclamationService;

    @Operation(
            summary = "Uploader une pièce jointe",
            description = "Le paramètre **id** est l'identifiant de la **réclamation** (ex. `2026-REC-00001`), pas celui d'un utilisateur (`...-USR-...`). "
                    + "Dans Swagger comme dans l'app : copiez-le depuis la réponse de **POST /api/reclamations** ou depuis **GET /api/reclamations** (champ `id` du ticket). "
                    + "On ne peut pas deviner automatiquement le ticket si l'utilisateur en a plusieurs.")
    @PostMapping(value = "/{id}/pieces-jointes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> upload(
            Authentication authentication,
            @Parameter(
                    description = "Identifiant de la réclamation (format année-REC-numéro). À copier depuis la création ou la liste des réclamations.",
                    example = "2026-REC-00001",
                    required = true)
            @PathVariable String id,
            @Parameter(description = "Fichier à joindre", required = true)
            @RequestParam("fichier") MultipartFile fichier) throws IOException {
        fileStorageService.stockerFichier(fichier, id, authentication.getName());
        return ResponseEntity.ok("Fichier mis en ligne avec succès.");
    }

    @Operation(
            summary = "Télécharger une pièce jointe",
            description = "JWT obligatoire. Seuls le **créateur** de la réclamation liée ou un **admin** peuvent télécharger.")
    @GetMapping("/pieces-jointes/{id}")
    public ResponseEntity<Resource> download(
            Authentication authentication,
            @Parameter(description = "Identifiant numérique de la pièce jointe (champ `id` dans `piecesJointes` du détail réclamation).", required = true)
            @PathVariable Long id) throws IOException {
        ReclamationAttachment pieces = reclamationService.verifierAccesEtObtenirPieceJointe(authentication.getName(), id);
        Resource resource = fileStorageService.getFichier(pieces.getCheminFichier());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(pieces.getTypeContenu() != null ? pieces.getTypeContenu() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pieces.getNomFichier() + "\"")
                .body(resource);
    }
}
