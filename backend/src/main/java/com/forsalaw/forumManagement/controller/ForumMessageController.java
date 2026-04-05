package com.forsalaw.forumManagement.controller;

import com.forsalaw.forumManagement.model.ForumMessageDTO;
import com.forsalaw.forumManagement.model.SetForumReactionRequest;
import com.forsalaw.forumManagement.model.UpdateForumMessageRequest;
import com.forsalaw.forumManagement.service.ForumService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forum/messages")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ForumMessageController {

    private final ForumService forumService;

    @Operation(summary = "Modifier son message (ou admin)")
    @PutMapping("/{messageId}")
    @PreAuthorize("hasAnyRole('CLIENT','AVOCAT','ADMIN')")
    public ResponseEntity<ForumMessageDTO> updateMessage(
            Authentication authentication,
            @PathVariable String messageId,
            @Valid @RequestBody UpdateForumMessageRequest request
    ) {
        return ResponseEntity.ok(forumService.updateMessage(authentication.getName(), messageId, request));
    }

    @Operation(summary = "Supprimer son message (ou admin)")
    @DeleteMapping("/{messageId}")
    @PreAuthorize("hasAnyRole('CLIENT','AVOCAT','ADMIN')")
    public ResponseEntity<Void> deleteMessage(
            Authentication authentication,
            @PathVariable String messageId
    ) {
        forumService.deleteMessage(authentication.getName(), messageId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reagir a un message (like, love, etc.) — une reaction par utilisateur ; remplace la precedente.")
    @PutMapping("/{messageId}/reactions")
    @PreAuthorize("hasAnyRole('CLIENT','AVOCAT','ADMIN')")
    public ResponseEntity<ForumMessageDTO> setReaction(
            Authentication authentication,
            @PathVariable String messageId,
            @Valid @RequestBody SetForumReactionRequest request
    ) {
        return ResponseEntity.ok(forumService.setReaction(authentication.getName(), messageId, request.getType()));
    }

    @Operation(summary = "Retirer sa reaction sur un message")
    @DeleteMapping("/{messageId}/reactions")
    @PreAuthorize("hasAnyRole('CLIENT','AVOCAT','ADMIN')")
    public ResponseEntity<ForumMessageDTO> removeReaction(
            Authentication authentication,
            @PathVariable String messageId
    ) {
        return ResponseEntity.ok(forumService.removeReaction(authentication.getName(), messageId));
    }
}
