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
public class ForumMessageDTO {

    private String id;
    private String topicId;
    private String authorUserId;
    private String authorNomComplet;
    private String authorRole;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
