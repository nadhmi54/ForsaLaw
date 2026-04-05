package com.forsalaw.forumManagement.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class ForumMessageDTO {

    private String id;
    private String topicId;
    private String authorUserId;
    private String authorNomComplet;
    private String authorRole;
    /** Contenu UTF-8 (emojis Unicode autorisés). */
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    /** Compteur par type de réaction (clé = nom de l'enum, ex. LIKE, LOVE). */
    private Map<String, Long> reactionCounts = new LinkedHashMap<>();
    /** Réaction de l'utilisateur connecté sur ce message, si applicable. */
    private String myReaction;
}
