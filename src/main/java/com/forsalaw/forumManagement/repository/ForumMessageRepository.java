package com.forsalaw.forumManagement.repository;

import com.forsalaw.forumManagement.entity.ForumMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumMessageRepository extends JpaRepository<ForumMessage, String> {

    Page<ForumMessage> findByTopic_IdOrderByCreatedAtAsc(String topicId, Pageable pageable);

    long countByTopic_Id(String topicId);

    void deleteByTopic_Id(String topicId);
}
