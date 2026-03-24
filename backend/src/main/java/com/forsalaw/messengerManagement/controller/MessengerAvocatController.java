package com.forsalaw.messengerManagement.controller;

import com.forsalaw.messengerManagement.model.*;
import com.forsalaw.messengerManagement.service.MessengerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messenger/avocat")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AVOCAT')")
@SecurityRequirement(name = "bearerAuth")
public class MessengerAvocatController {

    private final MessengerService messengerService;

    @Operation(summary = "Ouvrir ou récupérer une conversation", description = "Crée une conversation avec le client indiqué (id utilisateur …-USR-…) ou retourne la conversation existante. Symétrique de POST /api/messenger/conversations côté client.")
    @PostMapping("/conversations")
    public ResponseEntity<ConversationSummaryDTO> openOrGetConversation(
            Authentication authentication,
            @Valid @RequestBody OpenConversationWithClientRequest request
    ) {
        return ResponseEntity.ok(messengerService.openOrGetConversationForAvocat(authentication.getName(), request));
    }

    @Operation(summary = "Envoyer un message à un client (simple)", description = "Body : clientUserId + texte. Crée la conversation en base si c'est le premier échange. Réponse : conversationId + message créé.")
    @PostMapping("/messages")
    public ResponseEntity<MessengerSendResultDTO> sendMessageToClient(
            Authentication authentication,
            @Valid @RequestBody SendMessageToClientRequest request
    ) {
        return ResponseEntity.ok(messengerService.sendMessageToClientSimple(authentication.getName(), request));
    }

    @Operation(summary = "Liste de mes conversations", description = "Conversations de l'avocat avec les clients.")
    @GetMapping("/conversations")
    public ResponseEntity<Page<ConversationSummaryDTO>> listConversations(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(messengerService.listConversationsForAvocat(authentication.getName(), pageable));
    }

    @Operation(summary = "Messages d'une conversation (paginé)", description = "Historique des messages pour l'avocat.")
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<Page<MessengerMessageDTO>> getMessages(
            Authentication authentication,
            @PathVariable("id") String conversationId,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(messengerService.getMessagesForAvocat(authentication.getName(), conversationId, pageable));
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
