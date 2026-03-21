package com.forsalaw.messengerManagement.repository;

import com.forsalaw.messengerManagement.entity.MessengerMessage;
import com.forsalaw.messengerManagement.entity.MessengerSenderRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface MessengerMessageRepository extends JpaRepository<MessengerMessage, String> {

    Page<MessengerMessage> findByConversation_IdOrderByCreatedAtAsc(String conversationId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM MessengerMessage m JOIN m.conversation c WHERE c.client.id = :clientUserId " +
           "AND m.senderRole = :role AND (c.clientLastReadAt IS NULL OR m.createdAt > c.clientLastReadAt)")
    long countUnreadMessagesForClient(@Param("clientUserId") String clientUserId,
                                      @Param("role") MessengerSenderRole avocatRole);

    @Query("SELECT COUNT(m) FROM MessengerMessage m JOIN m.conversation c WHERE c.avocat.id = :avocatId " +
           "AND m.senderRole = :role AND (c.avocatLastReadAt IS NULL OR m.createdAt > c.avocatLastReadAt)")
    long countUnreadMessagesForAvocat(@Param("avocatId") String avocatId,
                                      @Param("role") MessengerSenderRole clientRole);

    /**
     * Compte les messages de l'interlocuteur après la date de lecture.
     * Passer une date très ancienne (ex. 1970) si jamais lu — ne pas utiliser {@code :readAt IS NULL} en JPQL (PostgreSQL : type du paramètre indéterminé).
     */
    @Query("SELECT COUNT(m) FROM MessengerMessage m WHERE m.conversation.id = :convId AND m.senderRole = :role " +
           "AND m.createdAt > :readAt")
    long countUnreadInConversation(@Param("convId") String convId,
                                   @Param("role") MessengerSenderRole role,
                                   @Param("readAt") LocalDateTime readAt);
}
