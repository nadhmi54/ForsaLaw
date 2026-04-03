package com.forsalaw.messengerManagement.realtime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessengerTypingPayload {

    private String fromEmail;
    private boolean typing;
}
