package com.forsalaw.forumManagement.controller;

import com.forsalaw.forumManagement.model.*;
import com.forsalaw.forumManagement.service.ForumService;
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
@RequestMapping("/api/forum/topics")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ForumTopicController {

    private final ForumService forumService;

    @Operation(summary = "Lister les topics (public)")
    @GetMapping
    public ResponseEntity<Page<ForumTopicDTO>> listTopics(
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(forumService.listTopics(pageable));
    }

    @Operation(summary = "Detail d'un topic (public)")
    @GetMapping("/{topicId}")
    public ResponseEntity<ForumTopicDTO> getTopic(@PathVariable String topicId) {
        return ResponseEntity.ok(forumService.getTopic(topicId));
    }

    @Operation(summary = "Creer un topic (client ou avocat)")
    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT','AVOCAT')")
    public ResponseEntity<ForumTopicDTO> createTopic(
            Authentication authentication,
            @Valid @RequestBody CreateForumTopicRequest request
    ) {
        return ResponseEntity.ok(forumService.createTopic(authentication.getName(), request));
    }

    @Operation(summary = "Modifier son topic (ou admin)")
    @PutMapping("/{topicId}")
    @PreAuthorize("hasAnyRole('CLIENT','AVOCAT','ADMIN')")
    public ResponseEntity<ForumTopicDTO> updateTopic(
            Authentication authentication,
            @PathVariable String topicId,
            @Valid @RequestBody UpdateForumTopicRequest request
    ) {
        return ResponseEntity.ok(forumService.updateTopic(authentication.getName(), topicId, request));
    }

    @Operation(summary = "Supprimer son topic (ou admin)")
    @DeleteMapping("/{topicId}")
    @PreAuthorize("hasAnyRole('CLIENT','AVOCAT','ADMIN')")
    public ResponseEntity<Void> deleteTopic(
            Authentication authentication,
            @PathVariable String topicId
    ) {
        forumService.deleteTopic(authentication.getName(), topicId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Lister les messages d'un topic (public)")
    @GetMapping("/{topicId}/messages")
    public ResponseEntity<Page<ForumMessageDTO>> listMessages(
            @PathVariable String topicId,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(forumService.listMessages(topicId, pageable));
    }

    @Operation(summary = "Ajouter un message dans un topic (client ou avocat)")
    @PostMapping("/{topicId}/messages")
    @PreAuthorize("hasAnyRole('CLIENT','AVOCAT')")
    public ResponseEntity<ForumMessageDTO> createMessage(
            Authentication authentication,
            @PathVariable String topicId,
            @Valid @RequestBody CreateForumMessageRequest request
    ) {
        return ResponseEntity.ok(forumService.createMessage(authentication.getName(), topicId, request));
    }
}
