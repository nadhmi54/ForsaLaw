package com.forsalaw.forumManagement.model;

import com.forsalaw.forumManagement.entity.ForumReactionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SetForumReactionRequest {

    @NotNull
    private ForumReactionType type;
}
