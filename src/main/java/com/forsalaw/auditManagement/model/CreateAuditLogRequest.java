package com.forsalaw.auditManagement.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAuditLogRequest {

    private String actorUserId;

    @NotBlank(message = "moduleName est obligatoire.")
    private String moduleName;

    @NotBlank(message = "action est obligatoire.")
    private String action;

    private String method;
    private String endpoint;
    private String resourceId;
    private Integer httpStatus;
    private String ipAddress;
    private String userAgent;
    private String details;
}
