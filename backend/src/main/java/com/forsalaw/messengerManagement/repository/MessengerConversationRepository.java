package com.forsalaw.messengerManagement.repository;

import com.forsalaw.messengerManagement.entity.MessengerConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessengerConversationRepository extends JpaRepository<MessengerConversation, String> {

    Optional<MessengerConversation> findByClient_IdAndAvocat_Id(String clientUserId, String avocatId);

    Page<MessengerConversation> findByClient_Id(String clientUserId, Pageable pageable);

    Page<MessengerConversation> findByAvocat_Id(String avocatId, Pageable pageable);

    @Query("SELECT c FROM MessengerConversation c WHERE " +
           "(:clientId IS NULL OR c.client.id = :clientId) AND " +
           "(:avocatId IS NULL OR c.avocat.id = :avocatId)")
    Page<MessengerConversation> findForAdmin(
            @Param("clientId") String clientId,
            @Param("avocatId") String avocatId,
            Pageable pageable
    );
}
