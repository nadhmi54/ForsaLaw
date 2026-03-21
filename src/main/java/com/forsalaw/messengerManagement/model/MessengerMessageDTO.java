package com.forsalaw.messengerManagement.model;

import com.forsalaw.messengerManagement.entity.MessengerSenderRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessengerMessageDTO {

    private String id;
    private String senderUserId;
    private MessengerSenderRole senderRole;
    private String content;
    private LocalDateTime createdAt;
}
