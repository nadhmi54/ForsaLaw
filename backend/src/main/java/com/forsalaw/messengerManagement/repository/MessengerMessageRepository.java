package com.forsalaw.messengerManagement.repository;

import com.forsalaw.messengerManagement.entity.MessengerMessage;
import com.forsalaw.messengerManagement.entity.MessengerSenderRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface MessengerMessageRepository extends JpaRepository<MessengerMessage, String> {

    Page<MessengerMessage> findByConversation_IdOrderByCreatedAtAsc(String conversationId, Pageable pageable);

    Page<MessengerMessage> findByConversation_IdAndCreatedAtAfterOrderByCreatedAtAsc(
            String conversationId, LocalDateTime after, Pageable pageable);

    /** Messages de l'avocat non lus par le client (pas de read_at_by_client). */
    @Query("SELECT COUNT(m) FROM MessengerMessage m JOIN m.conversation c WHERE c.client.id = :clientUserId "
            + "AND m.senderRole = :role AND m.readAtByClient IS NULL")
    long countUnreadMessagesForClient(@Param("clientUserId") String clientUserId,
                                      @Param("role") MessengerSenderRole avocatRole);

    /** Messages du client non lus par l'avocat (pas de read_at_by_avocat). */
    @Query("SELECT COUNT(m) FROM MessengerMessage m JOIN m.conversation c WHERE c.avocat.id = :avocatId "
            + "AND m.senderRole = :role AND m.readAtByAvocat IS NULL")
    long countUnreadMessagesForAvocat(@Param("avocatId") String avocatId,
                                      @Param("role") MessengerSenderRole clientRole);

    @Query("SELECT COUNT(m) FROM MessengerMessage m WHERE m.conversation.id = :convId AND m.senderRole = :role "
            + "AND m.readAtByClient IS NULL")
    long countUnreadInConversationForClientView(@Param("convId") String convId,
                                                @Param("role") MessengerSenderRole role);

    @Query("SELECT COUNT(m) FROM MessengerMessage m WHERE m.conversation.id = :convId AND m.senderRole = :role "
            + "AND m.readAtByAvocat IS NULL")
    long countUnreadInConversationForAvocatView(@Param("convId") String convId,
                                                @Param("role") MessengerSenderRole role);

    @Modifying
    @Query("UPDATE MessengerMessage m SET m.deliveredAtToClient = :t WHERE m.conversation.id = :convId "
            + "AND m.senderRole = :role AND m.deliveredAtToClient IS NULL")
    int markDeliveredToClient(@Param("convId") String convId,
                              @Param("role") MessengerSenderRole role,
                              @Param("t") LocalDateTime t);

    @Modifying
    @Query("UPDATE MessengerMessage m SET m.deliveredAtToAvocat = :t WHERE m.conversation.id = :convId "
            + "AND m.senderRole = :role AND m.deliveredAtToAvocat IS NULL")
    int markDeliveredToAvocat(@Param("convId") String convId,
                              @Param("role") MessengerSenderRole role,
                              @Param("t") LocalDateTime t);

    @Modifying
    @Query("UPDATE MessengerMessage m SET m.readAtByClient = :t WHERE m.conversation.id = :convId "
            + "AND m.senderRole = :role AND m.readAtByClient IS NULL")
    int markReadByClient(@Param("convId") String convId,
                         @Param("role") MessengerSenderRole role,
                         @Param("t") LocalDateTime t);

    @Modifying
    @Query("UPDATE MessengerMessage m SET m.readAtByAvocat = :t WHERE m.conversation.id = :convId "
            + "AND m.senderRole = :role AND m.readAtByAvocat IS NULL")
    int markReadByAvocat(@Param("convId") String convId,
                         @Param("role") MessengerSenderRole role,
                         @Param("t") LocalDateTime t);
}
