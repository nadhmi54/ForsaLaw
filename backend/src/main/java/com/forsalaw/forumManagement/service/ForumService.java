package com.forsalaw.forumManagement.service;

import com.forsalaw.forumManagement.entity.ForumMessage;
import com.forsalaw.forumManagement.entity.ForumMessageReaction;
import com.forsalaw.forumManagement.entity.ForumReactionType;
import com.forsalaw.forumManagement.entity.ForumTopic;
import com.forsalaw.forumManagement.model.*;
import com.forsalaw.forumManagement.repository.ForumMessageReactionRepository;
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

import java.util.*;

@Service
@RequiredArgsConstructor
public class ForumService {

    private static final int MAX_MESSAGE_LENGTH = 12_000;

    private final ForumTopicRepository topicRepository;
    private final ForumMessageRepository messageRepository;
    private final ForumMessageReactionRepository reactionRepository;
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
    public Page<ForumMessageDTO> listMessages(String topicId, Pageable pageable, String viewerEmail) {
        if (!topicRepository.existsById(topicId)) {
            throw new IllegalArgumentException("Topic non trouve.");
        }
        Page<ForumMessage> page = messageRepository.findByTopic_IdOrderByCreatedAtAsc(topicId, pageable);
        List<String> ids = page.getContent().stream().map(ForumMessage::getId).toList();
        Map<String, Map<String, Long>> countsByMessage = aggregateReactionCounts(ids);
        Map<String, String> myByMessage = new HashMap<>();
        if (viewerEmail != null && !viewerEmail.isBlank()) {
            userRepository.findByEmail(viewerEmail.trim().toLowerCase()).ifPresent(u ->
                    loadMyReactions(ids, u.getId(), myByMessage));
        }
        Map<String, String> finalMy = myByMessage;
        return page.map(m -> toMessageDTO(m, countsByMessage.getOrDefault(m.getId(), Collections.emptyMap()), finalMy.get(m.getId())));
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
        return toMessageDTO(message, baseZeroCounts(), null);
    }

    @Transactional
    public ForumMessageDTO updateMessage(String email, String messageId, UpdateForumMessageRequest request) {
        User actor = requireUser(email);
        ForumMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message non trouve."));

        assertOwnerOrAdmin(actor, message.getAuthor().getId());

        message.setContent(cleanContent(request.getContent()));
        message = messageRepository.save(message);
        return toMessageDTOWithReactions(message, email);
    }

    @Transactional
    public void deleteMessage(String email, String messageId) {
        User actor = requireUser(email);
        ForumMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message non trouve."));

        assertOwnerOrAdmin(actor, message.getAuthor().getId());
        messageRepository.delete(message);
    }

    /**
     * Pose ou met à jour la réaction de l'utilisateur sur un message (une seule par message).
     */
    @Transactional
    public ForumMessageDTO setReaction(String email, String messageId, ForumReactionType type) {
        User actor = requireUser(email);
        assertReactionActor(actor);

        ForumMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message non trouve."));

        Optional<ForumMessageReaction> existing = reactionRepository.findByMessage_IdAndUser_Id(messageId, actor.getId());
        if (existing.isPresent()) {
            ForumMessageReaction r = existing.get();
            r.setReactionType(type);
            reactionRepository.save(r);
        } else {
            ForumMessageReaction r = new ForumMessageReaction();
            r.setId(userService.generateNextId("FTR"));
            r.setMessage(message);
            r.setUser(actor);
            r.setReactionType(type);
            reactionRepository.save(r);
        }
        return toMessageDTOWithReactions(message, email);
    }

    @Transactional
    public ForumMessageDTO removeReaction(String email, String messageId) {
        User actor = requireUser(email);
        assertReactionActor(actor);

        ForumMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message non trouve."));

        reactionRepository.findByMessage_IdAndUser_Id(messageId, actor.getId())
                .ifPresent(reactionRepository::delete);
        return toMessageDTOWithReactions(message, email);
    }

    private void loadMyReactions(List<String> messageIds, String userId, Map<String, String> out) {
        if (messageIds.isEmpty()) {
            return;
        }
        for (ForumMessageReaction r : reactionRepository.findByMessage_IdInAndUser_Id(messageIds, userId)) {
            out.put(r.getMessage().getId(), r.getReactionType().name());
        }
    }

    private Map<String, Map<String, Long>> aggregateReactionCounts(List<String> messageIds) {
        Map<String, Map<String, Long>> grouped = new HashMap<>();
        if (messageIds.isEmpty()) {
            return grouped;
        }
        for (Object[] row : reactionRepository.countByMessageIdsGrouped(messageIds)) {
            String mid = (String) row[0];
            ForumReactionType rt = (ForumReactionType) row[1];
            Long cnt = (Long) row[2];
            grouped.computeIfAbsent(mid, k -> new LinkedHashMap<>()).put(rt.name(), cnt);
        }
        return grouped;
    }

    private Map<String, Long> mergeCountsWithZeros(Map<String, Long> partial) {
        Map<String, Long> out = new LinkedHashMap<>();
        for (ForumReactionType t : ForumReactionType.values()) {
            out.put(t.name(), partial.getOrDefault(t.name(), 0L));
        }
        return out;
    }

    private Map<String, Long> baseZeroCounts() {
        return mergeCountsWithZeros(Collections.emptyMap());
    }

    private ForumMessageDTO toMessageDTOWithReactions(ForumMessage message, String viewerEmail) {
        String mid = message.getId();
        Map<String, Map<String, Long>> g = aggregateReactionCounts(List.of(mid));
        String my = null;
        if (viewerEmail != null && !viewerEmail.isBlank()) {
            Optional<User> u = userRepository.findByEmail(viewerEmail.trim().toLowerCase());
            if (u.isPresent()) {
                my = reactionRepository.findByMessage_IdAndUser_Id(mid, u.get().getId())
                        .map(r -> r.getReactionType().name())
                        .orElse(null);
            }
        }
        return toMessageDTO(message, g.getOrDefault(mid, Collections.emptyMap()), my);
    }

    private ForumMessageDTO toMessageDTO(ForumMessage message, Map<String, Long> countPartial, String myReaction) {
        User author = message.getAuthor();
        ForumMessageDTO dto = new ForumMessageDTO();
        dto.setId(message.getId());
        dto.setTopicId(message.getTopic().getId());
        dto.setAuthorUserId(author.getId());
        dto.setAuthorNomComplet(author.getNom() + " " + author.getPrenom());
        dto.setAuthorRole(author.getRoleUser().name());
        dto.setContent(message.getContent());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());
        dto.setReactionCounts(mergeCountsWithZeros(countPartial));
        dto.setMyReaction(myReaction);
        return dto;
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

    private void assertReactionActor(User user) {
        RoleUser r = user.getRoleUser();
        if (r != RoleUser.client && r != RoleUser.avocat && r != RoleUser.admin) {
            throw new AccessDeniedException("Acces refuse pour les reactions forum.");
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
        if (value == null) {
            return "";
        }
        String t = value.trim();
        if (t.codePointCount(0, t.length()) > MAX_MESSAGE_LENGTH) {
            throw new IllegalArgumentException("Message trop long (maximum " + MAX_MESSAGE_LENGTH + " caracteres, emojis inclus).");
        }
        return t;
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
}
