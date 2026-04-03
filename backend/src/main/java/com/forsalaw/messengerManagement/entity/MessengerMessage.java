package com.forsalaw.messengerManagement.entity;

import com.forsalaw.userManagement.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Message dans une conversation messagerie.
 */
@Entity
@Table(name = "messenger_message")
@Getter
@Setter
public class MessengerMessage {

    @Id
    @Column(length = 20)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private MessengerConversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_user_id", nullable = false)
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_role", nullable = false, length = 20)
    private MessengerSenderRole senderRole;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Livré au client (messages envoyés par l'avocat). */
    @Column(name = "delivered_at_to_client")
    private LocalDateTime deliveredAtToClient;

    /** Lu par le client (messages envoyés par l'avocat). */
    @Column(name = "read_at_by_client")
    private LocalDateTime readAtByClient;

    /** Livré à l'avocat (messages envoyés par le client). */
    @Column(name = "delivered_at_to_avocat")
    private LocalDateTime deliveredAtToAvocat;

    /** Lu par l'avocat (messages envoyés par le client). */
    @Column(name = "read_at_by_avocat")
    private LocalDateTime readAtByAvocat;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
