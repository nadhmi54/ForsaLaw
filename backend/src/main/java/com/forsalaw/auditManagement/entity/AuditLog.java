package com.forsalaw.auditManagement.entity;

import com.forsalaw.userManagement.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log", indexes = {
        @Index(name = "idx_audit_log_actor", columnList = "actor_user_id"),
        @Index(name = "idx_audit_log_created_at", columnList = "created_at"),
        @Index(name = "idx_audit_log_module", columnList = "module_name")
})
@Getter
@Setter
public class AuditLog {

    @Id
    @Column(length = 20)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    private User actor;

    @Column(name = "module_name", nullable = false, length = 100)
    private String moduleName;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(length = 20)
    private String method;

    @Column(length = 255)
    private String endpoint;

    @Column(name = "resource_id", length = 100)
    private String resourceId;

    @Column(name = "http_status")
    private Integer httpStatus;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
