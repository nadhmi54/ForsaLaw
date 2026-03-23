package com.forsalaw.forumManagement.model;

import lombok.Data;

@Data
public class CreateForumTopicRequest {

    private String title;

    private String content;
}
