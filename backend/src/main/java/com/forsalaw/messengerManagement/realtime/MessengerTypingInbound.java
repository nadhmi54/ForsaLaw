package com.forsalaw.messengerManagement.realtime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Corps STOMP client → serveur pour /app/messenger/typing.
 */
@Getter
@Setter
@NoArgsConstructor
public class MessengerTypingInbound {

    private String conversationId;
    private boolean typing;
}
