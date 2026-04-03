package com.forsalaw.messengerManagement.repository;

import com.forsalaw.messengerManagement.entity.MessengerAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessengerAttachmentRepository extends JpaRepository<MessengerAttachment, String> {

    @Query("SELECT a FROM MessengerAttachment a JOIN FETCH a.message m WHERE m.id IN :ids")
    List<MessengerAttachment> findByMessage_IdIn(@Param("ids") List<String> messageIds);

    @Query("SELECT a FROM MessengerAttachment a "
            + "JOIN FETCH a.message m "
            + "JOIN FETCH m.conversation c "
            + "JOIN FETCH c.client "
            + "JOIN FETCH c.avocat av "
            + "JOIN FETCH av.user "
            + "WHERE a.id = :id")
    Optional<MessengerAttachment> findByIdForDownload(@Param("id") String id);
}
