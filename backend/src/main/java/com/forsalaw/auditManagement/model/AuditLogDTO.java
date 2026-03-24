package com.forsalaw.auditManagement.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {

    private String id;
    private String actorUserId;
    private String actorNomComplet;
    private String moduleName;
    private String action;
    private String method;
    private String endpoint;
    private String resourceId;
    private Integer httpStatus;
    private String ipAddress;
    private String userAgent;
    private String details;
    private LocalDateTime createdAt;
}
