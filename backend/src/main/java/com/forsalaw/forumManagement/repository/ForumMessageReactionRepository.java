package com.forsalaw.forumManagement.repository;

import com.forsalaw.forumManagement.entity.ForumMessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ForumMessageReactionRepository extends JpaRepository<ForumMessageReaction, String> {

    Optional<ForumMessageReaction> findByMessage_IdAndUser_Id(String messageId, String userId);

    List<ForumMessageReaction> findByMessage_IdInAndUser_Id(Collection<String> messageIds, String userId);

    @Query("SELECT r.message.id, r.reactionType, COUNT(r) FROM ForumMessageReaction r WHERE r.message.id IN :ids GROUP BY r.message.id, r.reactionType")
    List<Object[]> countByMessageIdsGrouped(@Param("ids") List<String> ids);
}
