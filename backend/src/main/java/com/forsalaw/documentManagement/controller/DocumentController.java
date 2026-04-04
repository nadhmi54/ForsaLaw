package com.forsalaw.documentManagement.controller;

import com.forsalaw.documentManagement.entity.ContexteDocument;
import com.forsalaw.documentManagement.model.DocumentAccessLogDTO;
import com.forsalaw.documentManagement.model.DocumentMetadataDTO;
import com.forsalaw.documentManagement.model.VerificationIntegriteDTO;
import com.forsalaw.documentManagement.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Endpoints du Coffre-fort Numérique pour les utilisateurs (Client/Avocat).
 * Permet d'uploader, télécharger et vérifier l'intégrité des documents.
 */
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Coffre-fort Numérique", description = "Gestion sécurisée des documents avec traçabilité et empreinte SHA-256")
public class DocumentController {

    private final DocumentService documentService;
    private final com.forsalaw.documentManagement.service.SignatureService signatureService;

    // ─── Signature Electronique ──────────────────────────────────────────────

    @Operation(summary = "Signer électroniquement un document")
    @PostMapping("/{id}/signer")
    public ResponseEntity<DocumentMetadataDTO> signerDocument(
            Authentication authentication,
            @PathVariable String id
    ) {
        return ResponseEntity.ok(signatureService.signerDocument(id, authentication.getName()));
    }

    @Operation(summary = "Vérifier la validité de la signature électronique")
    @GetMapping("/{id}/verify-signature")
    public ResponseEntity<java.util.Map<String, Object>> verifierSignature(@PathVariable String id) {
        return ResponseEntity.ok(signatureService.verifierSignature(id));
    }

    // ─── Upload ──────────────────────────────────────────────────────────────

    @Operation(
            summary = "Déposer un document dans le coffre-fort",
            description = "Upload un fichier, calcule son empreinte SHA-256 (sceau) et enregistre l'action dans le journal d'audit. Les paramètres `contexteType` et `contexteId` sont optionnels et permettent de lier le document à une réclamation, un dossier, etc."
    )
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentMetadataDTO> uploadDocument(
            Authentication authentication,
            @RequestParam("fichier") MultipartFile fichier,
            @RequestParam(value = "contexteType", required = false) ContexteDocument contexteType,
            @RequestParam(value = "contexteId", required = false) String contexteId,
            HttpServletRequest request
    ) throws IOException {
        return ResponseEntity.ok(
                documentService.uploadDocument(authentication.getName(), fichier, contexteType, contexteId, request)
        );
    }

    // ─── Téléchargement ──────────────────────────────────────────────────────

    @Operation(
            summary = "Télécharger un document",
            description = "Télécharge le fichier original. L'accès est tracé dans le journal d'audit. Seul le déposeur ou un admin peut télécharger."
    )
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> telechargerDocument(
            Authentication authentication,
            @PathVariable String id,
            HttpServletRequest request
    ) {
        Resource resource = documentService.telechargerDocument(authentication.getName(), id, request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    // ─── Vérification d'intégrité ────────────────────────────────────────────

    @Operation(
            summary = "Vérifier l'intégrité d'un document (sceau SHA-256)",
            description = "Recalcule le hash SHA-256 du fichier physique et le compare au hash stocké lors du dépôt. Retourne `integreite: true` si le document n'a jamais été modifié. L'action est tracée."
    )
    @GetMapping("/{id}/verifier-integrite")
    public ResponseEntity<VerificationIntegriteDTO> verifierIntegrite(
            Authentication authentication,
            @PathVariable String id,
            HttpServletRequest request
    ) throws IOException {
        return ResponseEntity.ok(documentService.verifierIntegrite(authentication.getName(), id, request));
    }

    // ─── Mes documents ────────────────────────────────────────────────────────

    @Operation(summary = "Lister mes documents", description = "Retourne la liste paginée de tous les documents que l'utilisateur connecté a déposés.")
    @GetMapping
    public ResponseEntity<Page<DocumentMetadataDTO>> mesDocuments(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "dateCreation", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(documentService.mesDocuments(authentication.getName(), pageable));
    }

    // ─── Documents par contexte ───────────────────────────────────────────────

    @Operation(
            summary = "Lister les documents d'un contexte (ex: réclamation)",
            description = "Retourne tous les documents liés à une entité spécifique. Exemple : tous les documents d'une réclamation avec `contexteType=RECLAMATION&contexteId=2026-REC-00001`"
    )
    @GetMapping("/contexte")
    public ResponseEntity<List<DocumentMetadataDTO>> documentsParContexte(
            @RequestParam ContexteDocument contexteType,
            @RequestParam String contexteId
    ) {
        return ResponseEntity.ok(documentService.documentsParContexte(contexteType, contexteId));
    }

    // ─── Historique d'accès ───────────────────────────────────────────────────

    @Operation(
            summary = "Historique des accès d'un document",
            description = "Affiche le journal d'audit d'un document : qui l'a uploadé, téléchargé, vérifié. Seul le déposeur ou un admin peut voir cet historique."
    )
    @GetMapping("/{id}/historique")
    public ResponseEntity<Page<DocumentAccessLogDTO>> historiqueDocument(
            Authentication authentication,
            @PathVariable String id,
            @PageableDefault(size = 20, sort = "dateAction", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(documentService.historiqueDocument(authentication.getName(), id, pageable));
    }
}
