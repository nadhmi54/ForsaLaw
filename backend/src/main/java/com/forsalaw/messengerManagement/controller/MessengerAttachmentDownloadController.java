package com.forsalaw.messengerManagement.controller;

import com.forsalaw.messengerManagement.entity.MessengerAttachment;
import com.forsalaw.messengerManagement.repository.MessengerAttachmentRepository;
import com.forsalaw.messengerManagement.service.MessengerAttachmentDownloadTokenService;
import com.forsalaw.messengerManagement.service.MessengerAttachmentService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/messenger/attachments")
@RequiredArgsConstructor
@Tag(name = "Messenger attachments")
public class MessengerAttachmentDownloadController {

    private final MessengerAttachmentRepository attachmentRepository;
    private final MessengerAttachmentService messengerAttachmentService;
    private final MessengerAttachmentDownloadTokenService downloadTokenService;

    @Operation(summary = "Telechargement (URL signee)",
            description = "Jeton JWT court dans le parametre token ; pas d'en-tete Authorization requis.")
    @GetMapping("/download")
    public ResponseEntity<Resource> download(@RequestParam("token") String token) {
        Claims claims;
        try {
            claims = downloadTokenService.parseAndValidate(token);
        } catch (JwtException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Lien expire ou invalide.");
        }
        Object typ = claims.get(MessengerAttachmentDownloadTokenService.CLAIM_TYP);
        if (!MessengerAttachmentDownloadTokenService.TYP_ATTACHMENT.equals(typ)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Jeton incorrect.");
        }
        String attachmentId = claims.get(MessengerAttachmentDownloadTokenService.CLAIM_ATTACHMENT_ID, String.class);
        String viewerEmail = claims.getSubject();
        if (attachmentId == null || viewerEmail == null || viewerEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Jeton incomplet.");
        }
        MessengerAttachment att = attachmentRepository.findByIdForDownload(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Piece jointe introuvable."));
        messengerAttachmentService.assertViewerCanDownload(att, viewerEmail);
        messengerAttachmentService.assertSafeToServe(att);
        Resource resource;
        try {
            resource = messengerAttachmentService.loadFile(att);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fichier introuvable.");
        }
        String filename = att.getOriginalFilename() != null ? att.getOriginalFilename() : "file";
        ContentDisposition cd = ContentDisposition.attachment()
                .filename(filename, StandardCharsets.UTF_8)
                .build();
        String ct = att.getContentType() != null ? att.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, cd.toString())
                .contentType(MediaType.parseMediaType(ct))
                .body(resource);
    }
}
