package com.forsalaw.messengerManagement.service;

import com.forsalaw.avocatManagement.entity.Avocat;
import com.forsalaw.avocatManagement.repository.AvocatRepository;
import com.forsalaw.messengerManagement.entity.ConversationStatus;
import com.forsalaw.messengerManagement.entity.MessengerAttachment;
import com.forsalaw.messengerManagement.entity.MessengerConversation;
import com.forsalaw.messengerManagement.entity.MessengerMessage;
import com.forsalaw.messengerManagement.entity.MessengerSenderRole;
import com.forsalaw.messengerManagement.model.*;
import com.forsalaw.messengerManagement.realtime.MessengerRealtimePublisher;
import com.forsalaw.messengerManagement.repository.MessengerAttachmentRepository;
import com.forsalaw.messengerManagement.repository.MessengerConversationRepository;
import com.forsalaw.messengerManagement.repository.MessengerMessageRepository;
import com.forsalaw.messengerManagement.util.MessengerContentHasher;
import com.forsalaw.userManagement.entity.RoleUser;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.repository.UserRepository;
import com.forsalaw.userManagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessengerService {

    private static final int PREVIEW_MAX = 200;

    @Value("${forsalaw.messenger.admin.hash-pepper:}")
    private String adminMessengerHashPepper;

    private final MessengerConversationRepository conversationRepository;
    private final MessengerMessageRepository messageRepository;
    private final MessengerAttachmentRepository attachmentRepository;
    private final MessengerAttachmentService messengerAttachmentService;
    private final UserRepository userRepository;
    private final AvocatRepository avocatRepository;
    private final UserService userService;
    private final MessengerRealtimePublisher messengerRealtimePublisher;

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

    @Transactional
    public Page<MessengerMessageDTO> getMessagesForClient(String clientEmail, String conversationId, Pageable pageable,
                                                          LocalDateTime since) {
        User client = requireUser(clientEmail);
        if (client.getRoleUser() != RoleUser.client) {
            throw new IllegalArgumentException("Accès réservé aux clients.");
        }
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        if (!c.getClient().getId().equals(client.getId())) {
            throw new IllegalArgumentException("Cette conversation ne vous appartient pas.");
        }
        LocalDateTime now = LocalDateTime.now();
        messageRepository.markDeliveredToClient(conversationId, MessengerSenderRole.AVOCAT, now);
        messageRepository.flush();
        Page<MessengerMessage> page = since == null
                ? messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId, pageable)
                : messageRepository.findByConversation_IdAndCreatedAtAfterOrderByCreatedAtAsc(conversationId, since, pageable);
        Map<String, List<MessengerAttachment>> byMsg = attachmentMapForMessages(page.getContent());
        String viewerId = client.getId();
        return page.map(m -> toMessageDTOWithAttachments(m, client.getEmail(), viewerId, byMsg));
    }

    @Transactional
    public Page<MessengerMessageDTO> getMessagesForAvocat(String avocatUserEmail, String conversationId, Pageable pageable,
                                                        LocalDateTime since) {
        Avocat avocat = requireAvocatByUserEmail(avocatUserEmail);
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        if (!c.getAvocat().getId().equals(avocat.getId())) {
            throw new IllegalArgumentException("Cette conversation ne vous appartient pas.");
        }
        LocalDateTime now = LocalDateTime.now();
        messageRepository.markDeliveredToAvocat(conversationId, MessengerSenderRole.CLIENT, now);
        messageRepository.flush();
        Page<MessengerMessage> page = since == null
                ? messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId, pageable)
                : messageRepository.findByConversation_IdAndCreatedAtAfterOrderByCreatedAtAsc(conversationId, since, pageable);
        Map<String, List<MessengerAttachment>> byMsg = attachmentMapForMessages(page.getContent());
        String viewerId = avocat.getUser().getId();
        return page.map(m -> toMessageDTOWithAttachments(m, avocat.getUser().getEmail(), viewerId, byMsg));
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
    public MessengerMessageDTO sendMessageWithAttachmentsAsClient(String clientEmail, String conversationId,
                                                                    String content, MultipartFile[] files) {
        User client = requireUser(clientEmail);
        if (client.getRoleUser() != RoleUser.client) {
            throw new IllegalArgumentException("Accès réservé aux clients.");
        }
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        if (!c.getClient().getId().equals(client.getId())) {
            throw new IllegalArgumentException("Cette conversation ne vous appartient pas.");
        }
        try {
            return persistMessageWithAttachments(c, client, MessengerSenderRole.CLIENT, content, files, client.getEmail());
        } catch (IOException e) {
            throw new IllegalStateException("Echec enregistrement des pieces jointes.", e);
        }
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

    @Transactional
    public MessengerMessageDTO sendMessageWithAttachmentsAsAvocat(String avocatUserEmail, String conversationId,
                                                                  String content, MultipartFile[] files) {
        Avocat avocat = requireAvocatByUserEmail(avocatUserEmail);
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        if (!c.getAvocat().getId().equals(avocat.getId())) {
            throw new IllegalArgumentException("Cette conversation ne vous appartient pas.");
        }
        User sender = avocat.getUser();
        try {
            return persistMessageWithAttachments(c, sender, MessengerSenderRole.AVOCAT, content, files, sender.getEmail());
        } catch (IOException e) {
            throw new IllegalStateException("Echec enregistrement des pieces jointes.", e);
        }
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
        LocalDateTime now = LocalDateTime.now();
        c.setClientLastReadAt(now);
        conversationRepository.save(c);
        messageRepository.markDeliveredToClient(conversationId, MessengerSenderRole.AVOCAT, now);
        messageRepository.markReadByClient(conversationId, MessengerSenderRole.AVOCAT, now);
        messengerRealtimePublisher.publishReadReceipt(conversationId, MessengerSenderRole.CLIENT, now);
    }

    @Transactional
    public void markReadAsAvocat(String avocatUserEmail, String conversationId) {
        Avocat avocat = requireAvocatByUserEmail(avocatUserEmail);
        MessengerConversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée."));
        if (!c.getAvocat().getId().equals(avocat.getId())) {
            throw new IllegalArgumentException("Cette conversation ne vous appartient pas.");
        }
        LocalDateTime now = LocalDateTime.now();
        c.setAvocatLastReadAt(now);
        conversationRepository.save(c);
        messageRepository.markDeliveredToAvocat(conversationId, MessengerSenderRole.CLIENT, now);
        messageRepository.markReadByAvocat(conversationId, MessengerSenderRole.CLIENT, now);
        messengerRealtimePublisher.publishReadReceipt(conversationId, MessengerSenderRole.AVOCAT, now);
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
    public Page<MessengerMessageDTO> getMessagesForAdmin(String adminEmail, String conversationId, Pageable pageable,
                                                         LocalDateTime since) {
        if (!conversationRepository.existsById(conversationId)) {
            throw new IllegalArgumentException("Conversation non trouvée.");
        }
        Page<MessengerMessage> page = since == null
                ? messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId, pageable)
                : messageRepository.findByConversation_IdAndCreatedAtAfterOrderByCreatedAtAsc(conversationId, since, pageable);
        Map<String, List<MessengerAttachment>> byMsg = attachmentMapForMessages(page.getContent());
        return page.map(m -> toMessageDTOForAdmin(m, byMsg));
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
        String content = rawContent != null ? rawContent.trim() : "";
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Le message ne peut pas être vide.");
        }
        MessengerMessage m = persistMessageEntity(c, sender, role, content);
        MessengerMessageDTO dto = toMessageDTO(m, sender.getEmail(), sender.getId(), List.of());
        messengerRealtimePublisher.publishNewMessage(c.getId(), dto);
        return dto;
    }

    private MessengerMessageDTO persistMessageWithAttachments(MessengerConversation c, User sender, MessengerSenderRole role,
                                                              String rawContent, MultipartFile[] files, String viewerEmailForResponse)
            throws IOException {
        String content = rawContent != null ? rawContent.trim() : "";
        if (content.isEmpty()) {
            content = "Piece jointe";
        }
        MessengerMessage m = persistMessageEntity(c, sender, role, content);
        List<MessengerAttachment> saved = messengerAttachmentService.saveAttachmentsForMessage(m, files, sender.getEmail());
        MessengerMessageDTO dto = toMessageDTO(m, viewerEmailForResponse, sender.getId(), saved);
        messengerRealtimePublisher.publishNewMessage(c.getId(), dto);
        return dto;
    }

    private MessengerMessage persistMessageEntity(MessengerConversation c, User sender, MessengerSenderRole role, String content) {
        if (c.getStatus() == ConversationStatus.CLOSED) {
            throw new IllegalArgumentException("Cette conversation est fermée. Aucun nouveau message n'est autorisé.");
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

        return m;
    }

    private Map<String, List<MessengerAttachment>> attachmentMapForMessages(List<MessengerMessage> messages) {
        if (messages.isEmpty()) {
            return Map.of();
        }
        List<String> ids = messages.stream().map(MessengerMessage::getId).toList();
        List<MessengerAttachment> all = attachmentRepository.findByMessage_IdIn(ids);
        return all.stream().collect(Collectors.groupingBy(a -> a.getMessage().getId()));
    }

    private MessengerMessageDTO toMessageDTOWithAttachments(MessengerMessage m, String viewerEmail, String viewerUserId,
                                                            Map<String, List<MessengerAttachment>> byMessageId) {
        return toMessageDTO(m, viewerEmail, viewerUserId, byMessageId.getOrDefault(m.getId(), List.of()));
    }

    /**
     * Réponse admin : contenu texte haché (SHA-256), pièces jointes sans URL ni noms de fichiers réels.
     */
    private MessengerMessageDTO toMessageDTOForAdmin(MessengerMessage m,
                                                     Map<String, List<MessengerAttachment>> byMessageId) {
        List<MessengerAttachmentDTO> redacted = byMessageId.getOrDefault(m.getId(), List.of()).stream()
                .map(this::toRedactedAttachmentDto)
                .toList();
        return new MessengerMessageDTO(
                m.getId(),
                m.getSender().getId(),
                m.getSenderRole(),
                MessengerContentHasher.sha256Hex(m.getContent(), adminMessengerHashPepper),
                m.getCreatedAt(),
                redacted,
                null
        );
    }

    private MessengerAttachmentDTO toRedactedAttachmentDto(MessengerAttachment a) {
        return new MessengerAttachmentDTO(
                a.getId(),
                "[masqué]",
                "application/octet-stream",
                a.getSizeBytes(),
                a.getScanStatus(),
                null
        );
    }

    private MessengerMessageDTO toMessageDTO(MessengerMessage m, String viewerEmail, String viewerUserId,
                                             List<MessengerAttachment> attachments) {
        List<MessengerAttachmentDTO> dtos = attachments.stream()
                .map(a -> messengerAttachmentService.toDto(a, viewerEmail))
                .toList();
        MessengerRecipientReceiptStatus receipt = null;
        if (viewerUserId != null && m.getSender().getId().equals(viewerUserId)) {
            receipt = computeRecipientReceipt(m);
        }
        return new MessengerMessageDTO(
                m.getId(),
                m.getSender().getId(),
                m.getSenderRole(),
                m.getContent(),
                m.getCreatedAt(),
                dtos,
                receipt
        );
    }

    private static MessengerRecipientReceiptStatus computeRecipientReceipt(MessengerMessage m) {
        if (m.getSenderRole() == MessengerSenderRole.CLIENT) {
            if (m.getReadAtByAvocat() != null) {
                return MessengerRecipientReceiptStatus.READ;
            }
            if (m.getDeliveredAtToAvocat() != null) {
                return MessengerRecipientReceiptStatus.DELIVERED;
            }
            return MessengerRecipientReceiptStatus.SENT;
        }
        if (m.getReadAtByClient() != null) {
            return MessengerRecipientReceiptStatus.READ;
        }
        if (m.getDeliveredAtToClient() != null) {
            return MessengerRecipientReceiptStatus.DELIVERED;
        }
        return MessengerRecipientReceiptStatus.SENT;
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
        long unread = messageRepository.countUnreadInConversationForClientView(c.getId(), MessengerSenderRole.AVOCAT);
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
        long unread = messageRepository.countUnreadInConversationForAvocatView(c.getId(), MessengerSenderRole.CLIENT);
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
                MessengerContentHasher.hashOptionalPreview(c.getLastMessagePreview(), adminMessengerHashPepper),
                c.getLastMessageAt(),
                c.getUpdatedAt(),
                0L
        );
    }

}
