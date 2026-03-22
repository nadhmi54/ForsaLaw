package com.forsalaw.reclamationManagement.controller;

import com.forsalaw.reclamationManagement.entity.ReclamationAttachment;
import com.forsalaw.reclamationManagement.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/reclamations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AttachmentController {

    private final FileStorageService fileStorageService;
    private final com.forsalaw.reclamationManagement.repository.ReclamationAttachmentRepository attachmentRepository;

    @Operation(summary = "Uploader une pièce jointe")
    @PostMapping("/{id}/pieces-jointes")
    public ResponseEntity<String> upload(@PathVariable String id, @RequestParam("fichier") MultipartFile fichier) throws IOException {
        fileStorageService.stockerFichier(fichier, id);
        return ResponseEntity.ok("Fichier mis en ligne avec succès.");
    }

    @Operation(summary = "Télécharger une pièce jointe")
    @GetMapping("/pieces-jointes/{id}")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws IOException {
        ReclamationAttachment pieces = attachmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pièce jointe non trouvée"));
        
        Path path = fileStorageService.getFichier(pieces.getCheminFichier());
        Resource resource = new UrlResource(path.toUri());

        if (resource.exists() || resource.isReadable()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(pieces.getTypeContenu() != null ? pieces.getTypeContenu() : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pieces.getNomFichier() + "\"")
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
