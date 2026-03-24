package com.forsalaw.forumManagement.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForumTopicDTO {

    private String id;
    private String title;
    private String content;
    private String authorUserId;
    private String authorNomComplet;
    private String authorRole;
    private long messagesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
