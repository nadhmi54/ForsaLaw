package com.forsalaw.messengerManagement.service;

import com.forsalaw.avocatManagement.entity.Avocat;
import com.forsalaw.avocatManagement.repository.AvocatRepository;
import com.forsalaw.messengerManagement.entity.ConversationStatus;
import com.forsalaw.messengerManagement.entity.MessengerConversation;
import com.forsalaw.messengerManagement.entity.MessengerMessage;
import com.forsalaw.messengerManagement.entity.MessengerSenderRole;
import com.forsalaw.messengerManagement.model.*;
import com.forsalaw.messengerManagement.repository.MessengerConversationRepository;
import com.forsalaw.messengerManagement.repository.MessengerMessageRepository;
import com.forsalaw.userManagement.entity.RoleUser;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.repository.UserRepository;
import com.forsalaw.userManagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MessengerService {

    private static final int PREVIEW_MAX = 200;

    /** Si jamais « lu », on compte tous les messages de l'interlocuteur (createdAt > cette date). */
    private static final LocalDateTime UNREAD_COUNT_SINCE = LocalDateTime.of(1970, 1, 1, 0, 0);

    private static LocalDateTime effectiveReadAtForUnreadCount(LocalDateTime lastReadAt) {
        return lastReadAt != null ? lastReadAt : UNREAD_COUNT_SINCE;
    }

    private final MessengerConversationRepository conversationRepository;
    private final MessengerMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AvocatRepository avocatRepository;
    private final UserService userService;

    @Transactional
    public ConversationSummaryDTO openOrGetConversation(String clientEmail, OpenConversationRequest request) {
        User client = requireUser(clientEmail);
        if (client.getRoleUser() != RoleUser.client) {
            throw new IllegalArgumentException("Seul un client peut ouvrir une conversation.");
        }
        Avocat avocat = avocatRepository.findById(request.getAvocatId())
                .orElseThrow(() -> new IllegalArgumentException("Avocat non trouvé."));
        if (!avocat.isActif()) {
            throw new IllegalArgumentException("Cet avocat n'est pas disponible.");
        }

        return conversationRepository.findByClient_IdAndAvocat_Id(client.getId(), avocat.getId())
                .map(this::toSummaryForClient)
                .orElseGet(() -> {
                    MessengerConversation c = new MessengerConversation();
                    c.setId(userService.generateNextId("CNV"));
                    c.setClient(client);
                    c.setAvocat(avocat);
                    c.setStatus(ConversationStatus.OPEN);
                    c = conversationRepository.save(c);
                    return toSummaryForClient(c);
                });
    }

    /**
     * Avocat : ouvre ou récupère la conversation avec un client (symétrique de {@link #openOrGetConversation} côté client).
     */
    @Transactional
    public ConversationSummaryDTO openOrGetConversationForAvocat(String avocatUserEmail, OpenConversationWithClientRequest request) {
        Avocat avocat = requireAvocatByUserEmail(avocatUserEmail);
        User client = userRepository.findById(request.getClientUserId())
                .orElseThrow(() -> new IllegalArgumentException("Client non trouvé."));
        if (client.getRoleUser() != RoleUser.client) {
            throw new IllegalArgumentException("L'utilisateur indiqué n'est pas un client.");
        }
        if (!client.isActif()) {
            throw new IllegalArgumentException("Ce compte client n'est pas disponible.");
        }

        return conversationRepository.findByClient_IdAndAvocat_Id(client.getId(), avocat.getId())
                .map(this::toSummaryForAvocat)
                .orElseGet(() -> {
                    MessengerConversation c = new MessengerConversation();
                    c.setId(userService.generateNextId("CNV"));
                    c.setClient(client);
                    c.setAvocat(avocat);
                    c.setStatus(ConversationStatus.OPEN);
                    c = conversationRepository.save(c);
                    return toSummaryForAvocat(c);
                });
    }

    @Transactional(readOnly = true)
    public Page<ConversationSummaryDTO> listConversationsForClient(String clientEmail, Pageable pageable) {
        User client = requireUser(clientEmail);
        if (client.getRoleUser() != RoleUser.client) {
            throw new IllegalArgumentException("Accès réservé aux clients.");
        }
        return conversationRepository.findByClient_Id(client.getId(), pageable)
                .map(this::toSummaryForClient);
    }

    @Transactional(readOnly = true)
    public Page<ConversationSummaryDTO> listConversationsForAvocat(String avocatUserEmail, Pageable pageable) {
        Avocat avocat = requireAvocatByUserEmail(avocatUserEmail);
        return conversationRepository.findByAvocat_Id(avocat.getId(), pageable)
                .map(this::toSummaryForAvocat);
    }

    @Transactional(readOnly = true)
    public Page<MessengerMessageDTO> getMessagesForClient(String clientEmail, String conversationId, Pageable pageable) {
        User client = requireUser(clientEmail);
        if (client.getRoleUser() != RoleUser.client) {
            throw new IllegalArgumentException("Accès réservé aux clients.");
        }
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        if (!c.getClient().getId().equals(client.getId())) {
            throw new IllegalArgumentException("Cette conversation ne vous appartient pas.");
        }
        return messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId, pageable)
                .map(this::toMessageDTO);
    }

    @Transactional(readOnly = true)
    public Page<MessengerMessageDTO> getMessagesForAvocat(String avocatUserEmail, String conversationId, Pageable pageable) {
        Avocat avocat = requireAvocatByUserEmail(avocatUserEmail);
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        if (!c.getAvocat().getId().equals(avocat.getId())) {
            throw new IllegalArgumentException("Cette conversation ne vous appartient pas.");
        }
        return messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId, pageable)
                .map(this::toMessageDTO);
    }

    @Transactional
    public MessengerMessageDTO sendMessageAsClient(String clientEmail, String conversationId, SendMessageRequest request) {
        User client = requireUser(clientEmail);
        if (client.getRoleUser() != RoleUser.client) {
            throw new IllegalArgumentException("Accès réservé aux clients.");
        }
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        if (!c.getClient().getId().equals(client.getId())) {
            throw new IllegalArgumentException("Cette conversation ne vous appartient pas.");
        }
        return persistMessage(c, client, MessengerSenderRole.CLIENT, request.getContent());
    }

    @Transactional
    public MessengerMessageDTO sendMessageAsAvocat(String avocatUserEmail, String conversationId, SendMessageRequest request) {
        Avocat avocat = requireAvocatByUserEmail(avocatUserEmail);
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        if (!c.getAvocat().getId().equals(avocat.getId())) {
            throw new IllegalArgumentException("Cette conversation ne vous appartient pas.");
        }
        User sender = avocat.getUser();
        return persistMessage(c, sender, MessengerSenderRole.AVOCAT, request.getContent());
    }

    /**
     * Client : envoie un message en ne fournissant que l'id avocat + le texte (crée la conversation si besoin).
     */
    @Transactional
    public MessengerSendResultDTO sendMessageToAvocatSimple(String clientEmail, SendMessageToAvocatRequest request) {
        OpenConversationRequest open = new OpenConversationRequest();
        open.setAvocatId(request.getAvocatId());
        ConversationSummaryDTO conv = openOrGetConversation(clientEmail, open);
        SendMessageRequest msgReq = new SendMessageRequest();
        msgReq.setContent(request.getContent());
        MessengerMessageDTO message = sendMessageAsClient(clientEmail, conv.getId(), msgReq);
        return new MessengerSendResultDTO(conv.getId(), message);
    }

    /**
     * Avocat : envoie un message avec seulement l'id client + le texte (crée la conversation si besoin, comme côté client).
     */
    @Transactional
    public MessengerSendResultDTO sendMessageToClientSimple(String avocatUserEmail, SendMessageToClientRequest request) {
        OpenConversationWithClientRequest open = new OpenConversationWithClientRequest();
        open.setClientUserId(request.getClientUserId());
        ConversationSummaryDTO conv = openOrGetConversationForAvocat(avocatUserEmail, open);
        SendMessageRequest msgReq = new SendMessageRequest();
        msgReq.setContent(request.getContent());
        MessengerMessageDTO message = sendMessageAsAvocat(avocatUserEmail, conv.getId(), msgReq);
        return new MessengerSendResultDTO(conv.getId(), message);
    }

    @Transactional
    public void markReadAsClient(String clientEmail, String conversationId) {
        User client = requireUser(clientEmail);
        if (client.getRoleUser() != RoleUser.client) {
            throw new IllegalArgumentException("Accès réservé aux clients.");
        }
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        if (!c.getClient().getId().equals(client.getId())) {
            throw new IllegalArgumentException("Cette conversation ne vous appartient pas.");
        }
        c.setClientLastReadAt(LocalDateTime.now());
        conversationRepository.save(c);
    }

    @Transactional
    public void markReadAsAvocat(String avocatUserEmail, String conversationId) {
        Avocat avocat = requireAvocatByUserEmail(avocatUserEmail);
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        if (!c.getAvocat().getId().equals(avocat.getId())) {
            throw new IllegalArgumentException("Cette conversation ne vous appartient pas.");
        }
        c.setAvocatLastReadAt(LocalDateTime.now());
        conversationRepository.save(c);
    }

    @Transactional(readOnly = true)
    public long unreadCountForClient(String clientEmail) {
        User client = requireUser(clientEmail);
        if (client.getRoleUser() != RoleUser.client) {
            throw new IllegalArgumentException("Accès réservé aux clients.");
        }
        return messageRepository.countUnreadMessagesForClient(client.getId(), MessengerSenderRole.AVOCAT);
    }

    @Transactional(readOnly = true)
    public long unreadCountForAvocat(String avocatUserEmail) {
        Avocat avocat = requireAvocatByUserEmail(avocatUserEmail);
        return messageRepository.countUnreadMessagesForAvocat(avocat.getId(), MessengerSenderRole.CLIENT);
    }

    // --- Admin ---

    @Transactional(readOnly = true)
    public Page<ConversationSummaryDTO> listConversationsForAdmin(String clientUserId, String avocatId, Pageable pageable) {
        return conversationRepository.findForAdmin(
                blankToNull(clientUserId),
                blankToNull(avocatId),
                pageable
        ).map(this::toSummaryAdmin);
    }

    @Transactional(readOnly = true)
    public Page<MessengerMessageDTO> getMessagesForAdmin(String conversationId, Pageable pageable) {
        if (!conversationRepository.existsById(conversationId)) {
            throw new IllegalArgumentException("Conversation non trouvée.");
        }
        return messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId, pageable)
                .map(this::toMessageDTO);
    }

    @Transactional
    public ConversationSummaryDTO closeConversationByAdmin(String conversationId) {
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        c.setStatus(ConversationStatus.CLOSED);
        c.setClosedAt(LocalDateTime.now());
        c = conversationRepository.save(c);
        return toSummaryAdmin(c);
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
    }

    private Avocat requireAvocatByUserEmail(String email) {
        User user = requireUser(email);
        if (user.getRoleUser() != RoleUser.avocat) {
            throw new IllegalArgumentException("Accès réservé aux avocats.");
        }
        return avocatRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profil avocat non trouvé."));
    }

    private MessengerMessageDTO persistMessage(MessengerConversation c, User sender, MessengerSenderRole role, String rawContent) {
        if (c.getStatus() == ConversationStatus.CLOSED) {
            throw new IllegalArgumentException("Cette conversation est fermée. Aucun nouveau message n'est autorisé.");
        }
        String content = rawContent != null ? rawContent.trim() : "";
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Le message ne peut pas être vide.");
        }

        MessengerMessage m = new MessengerMessage();
        m.setId(userService.generateNextId("MSM"));
        m.setConversation(c);
        m.setSender(sender);
        m.setSenderRole(role);
        m.setContent(content);
        m = messageRepository.save(m);

        c.setLastMessageAt(m.getCreatedAt());
        c.setLastMessagePreview(preview(content));
        conversationRepository.save(c);

        return toMessageDTO(m);
    }

    private String preview(String content) {
        if (content == null) {
            return null;
        }
        String t = content.trim();
        if (t.length() <= PREVIEW_MAX) {
            return t;
        }
        return t.substring(0, PREVIEW_MAX - 3) + "...";
    }

    private ConversationSummaryDTO toSummaryForClient(MessengerConversation c) {
        Avocat a = c.getAvocat();
        User avocatUser = a.getUser();
        long unread = messageRepository.countUnreadInConversation(
                c.getId(), MessengerSenderRole.AVOCAT, effectiveReadAtForUnreadCount(c.getClientLastReadAt()));
        return new ConversationSummaryDTO(
                c.getId(),
                c.getClient().getId(),
                c.getClient().getNom(),
                c.getClient().getPrenom(),
                a.getId(),
                avocatUser.getNom(),
                avocatUser.getPrenom(),
                c.getStatus(),
                c.getLastMessagePreview(),
                c.getLastMessageAt(),
                c.getUpdatedAt(),
                unread
        );
    }

    private ConversationSummaryDTO toSummaryForAvocat(MessengerConversation c) {
        User client = c.getClient();
        Avocat a = c.getAvocat();
        User avocatUser = a.getUser();
        long unread = messageRepository.countUnreadInConversation(
                c.getId(), MessengerSenderRole.CLIENT, effectiveReadAtForUnreadCount(c.getAvocatLastReadAt()));
        return new ConversationSummaryDTO(
                c.getId(),
                client.getId(),
                client.getNom(),
                client.getPrenom(),
                a.getId(),
                avocatUser.getNom(),
                avocatUser.getPrenom(),
                c.getStatus(),
                c.getLastMessagePreview(),
                c.getLastMessageAt(),
                c.getUpdatedAt(),
                unread
        );
    }

    private ConversationSummaryDTO toSummaryAdmin(MessengerConversation c) {
        User client = c.getClient();
        Avocat a = c.getAvocat();
        User avocatUser = a.getUser();
        return new ConversationSummaryDTO(
                c.getId(),
                client.getId(),
                client.getNom(),
                client.getPrenom(),
                a.getId(),
                avocatUser.getNom(),
                avocatUser.getPrenom(),
                c.getStatus(),
                c.getLastMessagePreview(),
                c.getLastMessageAt(),
                c.getUpdatedAt(),
                0L
        );
    }

    private MessengerMessageDTO toMessageDTO(MessengerMessage m) {
        return new MessengerMessageDTO(
                m.getId(),
                m.getSender().getId(),
                m.getSenderRole(),
                m.getContent(),
                m.getCreatedAt()
        );
    }
}
