package com.forsalaw.messengerManagement.entity;

import com.forsalaw.avocatManagement.entity.Avocat;
import com.forsalaw.userManagement.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Conversation entre un client et un avocat (messagerie type WhatsApp).
 */
@Entity
@Table(name = "messenger_conversation",
        uniqueConstraints = @UniqueConstraint(name = "uk_messenger_conv_client_avocat",
                columnNames = {"client_user_id", "avocat_id"}))
@Getter
@Setter
public class MessengerConversation {

    @Id
    @Column(length = 20)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_user_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avocat_id", nullable = false)
    private Avocat avocat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConversationStatus status = ConversationStatus.OPEN;

    @Column(name = "client_last_read_at")
    private LocalDateTime clientLastReadAt;

    @Column(name = "avocat_last_read_at")
    private LocalDateTime avocatLastReadAt;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "last_message_preview", length = 500)
    private String lastMessagePreview;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
