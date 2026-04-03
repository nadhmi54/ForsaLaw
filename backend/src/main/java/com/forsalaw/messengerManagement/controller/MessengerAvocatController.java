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
@RequestMapping("/api/messenger/avocat")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AVOCAT')")
@SecurityRequirement(name = "bearerAuth")
public class MessengerAvocatController {

    private final MessengerService messengerService;

    @Operation(summary = "Ouvrir ou récupérer une conversation",
            description = "Crée une conversation avec le client ou retourne celle existante. L'id utilisateur client est dans l'URL (fiche client / liste) — pas de body JSON. Le front compose l'URL depuis la route.")
    @PostMapping("/conversations/with-client/{clientUserId}")
    public ResponseEntity<ConversationSummaryDTO> openOrGetConversationWithClientInPath(
            Authentication authentication,
            @Parameter(description = "ID compte utilisateur client (…-USR-…)", example = "2026-USR-00001")
            @PathVariable("clientUserId") String clientUserId
    ) {
        OpenConversationWithClientRequest request = new OpenConversationWithClientRequest();
        request.setClientUserId(clientUserId);
        return ResponseEntity.ok(messengerService.openOrGetConversationForAvocat(authentication.getName(), request));
    }

    @Operation(summary = "Envoyer un message à un client (simple)",
            description = "L'id utilisateur client est dans l'URL ; le body ne contient que le texte. Crée la conversation si besoin. Réponse : conversationId + message.")
    @PostMapping("/messages/to-client/{clientUserId}")
    public ResponseEntity<MessengerSendResultDTO> sendMessageToClient(
            Authentication authentication,
            @Parameter(description = "ID compte utilisateur client (…-USR-…)", example = "2026-USR-00001")
            @PathVariable("clientUserId") String clientUserId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        SendMessageToClientRequest full = new SendMessageToClientRequest();
        full.setClientUserId(clientUserId);
        full.setContent(request.getContent());
        return ResponseEntity.ok(messengerService.sendMessageToClientSimple(authentication.getName(), full));
    }

    @Operation(summary = "Liste de mes conversations", description = "Conversations de l'avocat avec les clients.")
    @GetMapping("/conversations")
    public ResponseEntity<Page<ConversationSummaryDTO>> listConversations(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(messengerService.listConversationsForAvocat(authentication.getName(), pageable));
    }

    @Operation(summary = "Messages d'une conversation (paginé)",
            description = "Historique pour l'avocat. `since` (ISO-8601) optionnel : rattrapage des messages après cette date.")
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<Page<MessengerMessageDTO>> getMessages(
            Authentication authentication,
            @PathVariable("id") String conversationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(messengerService.getMessagesForAvocat(authentication.getName(), conversationId, pageable, since));
    }

    @Operation(summary = "Envoyer un message", description = "Envoie un message dans la conversation (avocat).")
    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<MessengerMessageDTO> sendMessage(
            Authentication authentication,
            @PathVariable("id") String conversationId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        return ResponseEntity.ok(messengerService.sendMessageAsAvocat(authentication.getName(), conversationId, request));
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
        return ResponseEntity.ok(messengerService.sendMessageWithAttachmentsAsAvocat(
                authentication.getName(), conversationId, form.getContent(), form.getFilesAsArray()));
    }

    @Operation(summary = "Marquer comme lu", description = "Marque les messages reçus des clients comme lus.")
    @PostMapping("/conversations/{id}/read")
    public ResponseEntity<Void> markRead(
            Authentication authentication,
            @PathVariable("id") String conversationId
    ) {
        messengerService.markReadAsAvocat(authentication.getName(), conversationId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Nombre de messages non lus", description = "Total des messages non lus (envoyés par les clients) pour l'avocat connecté.")
    @GetMapping("/unread-count")
    public ResponseEntity<Long> unreadCount(Authentication authentication) {
        return ResponseEntity.ok(messengerService.unreadCountForAvocat(authentication.getName()));
    }
}
