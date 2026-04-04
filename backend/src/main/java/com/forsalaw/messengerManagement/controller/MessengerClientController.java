package com.forsalaw.messengerManagement.controller;

import com.forsalaw.messengerManagement.model.*;
import com.forsalaw.messengerManagement.service.MessengerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/messenger")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENT')")
@SecurityRequirement(name = "bearerAuth")
public class MessengerClientController {

    private final MessengerService messengerService;

    @Operation(summary = "Ouvrir ou récupérer une conversation",
            description = "Crée une conversation avec l'avocat ou retourne celle existante. L'id profil avocat est dans l'URL (celui de la fiche / de la liste avocats) — pas de body JSON. Le front compose l'URL depuis la route.")
    @PostMapping("/conversations/with-avocat/{avocatId}")
    public ResponseEntity<ConversationSummaryDTO> openOrGetConversationWithAvocatInPath(
            Authentication authentication,
            @Parameter(description = "ID profil avocat (…-AVC-…)", example = "2026-AVC-00001")
            @PathVariable("avocatId") String avocatId
    ) {
        OpenConversationRequest request = new OpenConversationRequest();
        request.setAvocatId(avocatId);
        return ResponseEntity.ok(messengerService.openOrGetConversation(authentication.getName(), request));
    }

    @Operation(summary = "Envoyer un message à un avocat (simple)",
            description = "L'id profil avocat est dans l'URL ; le body ne contient que le texte. Crée la conversation si besoin. Réponse : conversationId + message.")
    @PostMapping("/messages/to-avocat/{avocatId}")
    public ResponseEntity<MessengerSendResultDTO> sendMessageToAvocat(
            Authentication authentication,
            @Parameter(description = "ID profil avocat (…-AVC-…)", example = "2026-AVC-00001") @PathVariable("avocatId") String avocatId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        SendMessageToAvocatRequest full = new SendMessageToAvocatRequest();
        full.setAvocatId(avocatId);
        full.setContent(request.getContent());
        return ResponseEntity.ok(messengerService.sendMessageToAvocatSimple(authentication.getName(), full));
    }

    @Operation(summary = "Liste de mes conversations", description = "Conversations du client avec les avocats, triées par dernière activité.")
    @GetMapping("/conversations")
    public ResponseEntity<Page<ConversationSummaryDTO>> listConversations(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(messengerService.listConversationsForClient(authentication.getName(), pageable));
    }

    @Operation(summary = "Messages d'une conversation (paginé)",
            description = "Historique chronologique. Paramètre optionnel `since` (ISO-8601) : messages strictement après cette date — rattrapage après reconnexion WebSocket.")
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<Page<MessengerMessageDTO>> getMessages(
            Authentication authentication,
            @PathVariable("id") String conversationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(messengerService.getMessagesForClient(authentication.getName(), conversationId, pageable, since));
    }

    @Operation(
            summary = "Envoyer un message avec pieces jointes",
            description = "Multipart : champ optionnel `content` (texte) + un ou plusieurs `files`. Types : pdf, png, jpg, jpeg, gif, webp ; taille max configuree cote serveur.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(implementation = MessengerMultipartForm.class)
                    )
            )
    )
    @PostMapping(value = "/conversations/{id}/messages/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessengerMessageDTO> sendMessageWithAttachments(
            Authentication authentication,
            @PathVariable("id") String conversationId,
            @Parameter(hidden = true) @ModelAttribute MessengerMultipartForm form
    ) {
        return ResponseEntity.ok(messengerService.sendMessageWithAttachmentsAsClient(
                authentication.getName(), conversationId, form.getContent(), form.getFilesAsArray()));
    }

    @Operation(summary = "Marquer comme lu", description = "Marque les messages reçus de l'avocat comme lus pour cette conversation.")
    @PostMapping("/conversations/{id}/read")
    public ResponseEntity<Void> markRead(
            Authentication authentication,
            @PathVariable("id") String conversationId
    ) {
        messengerService.markReadAsClient(authentication.getName(), conversationId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Nombre de messages non lus", description = "Total des messages non lus (envoyés par les avocats) pour le client connecté.")
    @GetMapping("/unread-count")
    public ResponseEntity<Long> unreadCount(Authentication authentication) {
        return ResponseEntity.ok(messengerService.unreadCountForClient(authentication.getName()));
    }
}
