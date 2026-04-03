package com.forsalaw.messengerManagement.realtime;

import com.forsalaw.messengerManagement.repository.MessengerConversationRepository;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class MessengerRealtimeAccessVerifier {

    private final MessengerConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public boolean canAccessConversation(String userEmail, String conversationId) {
        User u = userRepository.findByEmail(userEmail).orElse(null);
        if (u == null || !u.isActif()) {
            return false;
        }
        return conversationRepository.findById(conversationId)
                .map(c -> c.getClient().getId().equals(u.getId())
                        || c.getAvocat().getUser().getId().equals(u.getId()))
                .orElse(false);
    }
}
