package com.forsalaw.forumManagement.repository;

import com.forsalaw.forumManagement.entity.ForumTopic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumTopicRepository extends JpaRepository<ForumTopic, String> {

    Page<ForumTopic> findAllByOrderByUpdatedAtDesc(Pageable pageable);
}
