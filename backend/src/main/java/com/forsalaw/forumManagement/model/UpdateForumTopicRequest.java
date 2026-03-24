package com.forsalaw.forumManagement.model;

import lombok.Data;

@Data
public class UpdateForumTopicRequest {

    private String title;

    private String content;
}
