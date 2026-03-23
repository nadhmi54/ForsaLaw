package com.forsalaw.forumManagement.service;

import com.forsalaw.forumManagement.entity.ForumMessage;
import com.forsalaw.forumManagement.entity.ForumTopic;
import com.forsalaw.forumManagement.model.*;
import com.forsalaw.forumManagement.repository.ForumMessageRepository;
import com.forsalaw.forumManagement.repository.ForumTopicRepository;
import com.forsalaw.userManagement.entity.RoleUser;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.repository.UserRepository;
import com.forsalaw.userManagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumTopicRepository topicRepository;
    private final ForumMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public Page<ForumTopicDTO> listTopics(Pageable pageable) {
        return topicRepository.findAllByOrderByUpdatedAtDesc(pageable)
                .map(this::toTopicDTO);
    }

    @Transactional(readOnly = true)
    public ForumTopicDTO getTopic(String topicId) {
        ForumTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic non trouve."));
        return toTopicDTO(topic);
    }

    @Transactional
    public ForumTopicDTO createTopic(String email, CreateForumTopicRequest request) {
        User author = requireUser(email);
        assertClientOrAvocat(author);

        ForumTopic topic = new ForumTopic();
        topic.setId(userService.generateNextId("FTP"));
        topic.setAuthor(author);
        topic.setTitle(cleanTitle(request.getTitle()));
        topic.setContent(cleanContent(request.getContent()));

        topic = topicRepository.save(topic);
        return toTopicDTO(topic);
    }

    @Transactional
    public ForumTopicDTO updateTopic(String email, String topicId, UpdateForumTopicRequest request) {
        User actor = requireUser(email);
        ForumTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic non trouve."));

        assertOwnerOrAdmin(actor, topic.getAuthor().getId());

        topic.setTitle(cleanTitle(request.getTitle()));
        topic.setContent(cleanContent(request.getContent()));
        topic = topicRepository.save(topic);
        return toTopicDTO(topic);
    }

    @Transactional
    public void deleteTopic(String email, String topicId) {
        User actor = requireUser(email);
        ForumTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic non trouve."));

        assertOwnerOrAdmin(actor, topic.getAuthor().getId());
        messageRepository.deleteByTopic_Id(topicId);
        topicRepository.delete(topic);
    }

    @Transactional(readOnly = true)
    public Page<ForumMessageDTO> listMessages(String topicId, Pageable pageable) {
        if (!topicRepository.existsById(topicId)) {
            throw new IllegalArgumentException("Topic non trouve.");
        }
        return messageRepository.findByTopic_IdOrderByCreatedAtAsc(topicId, pageable)
                .map(this::toMessageDTO);
    }

    @Transactional
    public ForumMessageDTO createMessage(String email, String topicId, CreateForumMessageRequest request) {
        User author = requireUser(email);
        assertClientOrAvocat(author);

        ForumTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic non trouve."));

        ForumMessage message = new ForumMessage();
        message.setId(userService.generateNextId("FMS"));
        message.setTopic(topic);
        message.setAuthor(author);
        message.setContent(cleanContent(request.getContent()));

        message = messageRepository.save(message);
        return toMessageDTO(message);
    }

    @Transactional
    public ForumMessageDTO updateMessage(String email, String messageId, UpdateForumMessageRequest request) {
        User actor = requireUser(email);
        ForumMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message non trouve."));

        assertOwnerOrAdmin(actor, message.getAuthor().getId());

        message.setContent(cleanContent(request.getContent()));
        message = messageRepository.save(message);
        return toMessageDTO(message);
    }

    @Transactional
    public void deleteMessage(String email, String messageId) {
        User actor = requireUser(email);
        ForumMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message non trouve."));

        assertOwnerOrAdmin(actor, message.getAuthor().getId());
        messageRepository.delete(message);
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouve."));
    }

    private void assertClientOrAvocat(User user) {
        if (user.getRoleUser() != RoleUser.client && user.getRoleUser() != RoleUser.avocat) {
            throw new AccessDeniedException("Acces reserve aux clients et avocats.");
        }
    }

    private void assertOwnerOrAdmin(User actor, String ownerId) {
        boolean isAdmin = actor.getRoleUser() == RoleUser.admin;
        boolean isOwner = actor.getId().equals(ownerId);
        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("Acces refuse : ressource non autorisee.");
        }
    }

    private String cleanTitle(String value) {
        return value != null ? value.trim() : "";
    }

    private String cleanContent(String value) {
        return value != null ? value.trim() : "";
    }

    private ForumTopicDTO toTopicDTO(ForumTopic topic) {
        User author = topic.getAuthor();
        return new ForumTopicDTO(
                topic.getId(),
                topic.getTitle(),
                topic.getContent(),
                author.getId(),
                author.getNom() + " " + author.getPrenom(),
                author.getRoleUser().name(),
                messageRepository.countByTopic_Id(topic.getId()),
                topic.getCreatedAt(),
                topic.getUpdatedAt()
        );
    }

    private ForumMessageDTO toMessageDTO(ForumMessage message) {
        User author = message.getAuthor();
        return new ForumMessageDTO(
                message.getId(),
                message.getTopic().getId(),
                author.getId(),
                author.getNom() + " " + author.getPrenom(),
                author.getRoleUser().name(),
                message.getContent(),
                message.getCreatedAt(),
                message.getUpdatedAt()
        );
    }
}
