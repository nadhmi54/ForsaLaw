package com.forsalaw.messengerManagement.realtime;

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
public class MessengerReadReceiptPayload {

    private MessengerSenderRole readByRole;
    private LocalDateTime readAt;
}
