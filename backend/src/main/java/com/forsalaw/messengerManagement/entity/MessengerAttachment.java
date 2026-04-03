package com.forsalaw.messengerManagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Piece jointe liee a un message de messagerie (fichier stocke sur disque, reference en base).
 */
@Entity
@Table(name = "messenger_attachment")
@Getter
@Setter
public class MessengerAttachment {

    @Id
    @Column(length = 20)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    private MessengerMessage message;

    @Column(name = "original_filename", nullable = false, length = 500)
    private String originalFilename;

    @Column(name = "content_type", nullable = false, length = 120)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    /**
     * Chemin relatif sous le repertoire de stockage configure (pas de chemin absolu expose).
     */
    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "scan_status", nullable = false, length = 20)
    private AttachmentScanStatus scanStatus = AttachmentScanStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
