package com.forsalaw.messengerManagement.controller;

import com.forsalaw.messengerManagement.model.ConversationSummaryDTO;
import com.forsalaw.messengerManagement.model.MessengerMessageDTO;
import com.forsalaw.messengerManagement.service.MessengerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/messenger")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminMessengerController {

    private final MessengerService messengerService;

    @Operation(summary = "Liste des conversations (admin)", description = "Filtres optionnels : clientUserId (ID utilisateur client), avocatId (ID profil avocat).")
    @GetMapping("/conversations")
    public ResponseEntity<Page<ConversationSummaryDTO>> listConversations(
            @RequestParam(required = false) String clientId,
            @RequestParam(required = false) String avocatId,
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(messengerService.listConversationsForAdmin(clientId, avocatId, pageable));
    }

    @Operation(summary = "Messages d'une conversation (admin)", description = "Lecture des messages pour modération / support (contenu stocké en clair côté serveur ; chiffrer côté client en prod si besoin).")
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<Page<MessengerMessageDTO>> getMessages(
            @PathVariable("id") String conversationId,
            @PageableDefault(size = 100, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(messengerService.getMessagesForAdmin(conversationId, pageable));
    }

    @Operation(summary = "Fermer une conversation", description = "Passe la conversation en statut CLOSED ; plus de nouveaux messages possibles.")
    @PostMapping("/conversations/{id}/close")
    public ResponseEntity<ConversationSummaryDTO> closeConversation(@PathVariable("id") String conversationId) {
        return ResponseEntity.ok(messengerService.closeConversationByAdmin(conversationId));
    }
}
