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
@RequestMapping("/api/messenger")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENT')")
@SecurityRequirement(name = "bearerAuth")
public class MessengerClientController {

    private final MessengerService messengerService;

    @Operation(summary = "Ouvrir ou récupérer une conversation", description = "Crée une conversation avec l'avocat indiqué ou retourne la conversation existante (même client / même avocat).")
    @PostMapping("/conversations")
    public ResponseEntity<ConversationSummaryDTO> openOrGetConversation(
            Authentication authentication,
            @Valid @RequestBody OpenConversationRequest request
    ) {
        return ResponseEntity.ok(messengerService.openOrGetConversation(authentication.getName(), request));
    }

    @Operation(summary = "Envoyer un message à un avocat (simple)", description = "Body : id avocat (…-AVC-…) + texte. Crée la conversation en base si c'est le premier message. Réponse : conversationId (…-CNV-…) + message créé — pas besoin de connaître le CNV à l'avance.")
    @PostMapping("/messages")
    public ResponseEntity<MessengerSendResultDTO> sendMessageToAvocat(
            Authentication authentication,
            @Valid @RequestBody SendMessageToAvocatRequest request
    ) {
        return ResponseEntity.ok(messengerService.sendMessageToAvocatSimple(authentication.getName(), request));
    }

    @Operation(summary = "Liste de mes conversations", description = "Conversations du client avec les avocats, triées par dernière activité.")
    @GetMapping("/conversations")
    public ResponseEntity<Page<ConversationSummaryDTO>> listConversations(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(messengerService.listConversationsForClient(authentication.getName(), pageable));
    }

    @Operation(summary = "Messages d'une conversation (paginé)", description = "Historique des messages, chronologique (croissant).")
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<Page<MessengerMessageDTO>> getMessages(
            Authentication authentication,
            @PathVariable("id") String conversationId,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(messengerService.getMessagesForClient(authentication.getName(), conversationId, pageable));
    }

    @Operation(summary = "Envoyer un message", description = "Envoie un message dans la conversation (client).")
    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<MessengerMessageDTO> sendMessage(
            Authentication authentication,
            @PathVariable("id") String conversationId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        return ResponseEntity.ok(messengerService.sendMessageAsClient(authentication.getName(), conversationId, request));
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
