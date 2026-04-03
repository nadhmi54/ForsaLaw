package com.forsalaw.documentManagement.model;

import com.forsalaw.documentManagement.entity.ActionDocument;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentAccessLogDTO {
    private String id;
    private String acteurId;
    private String nomActeur;
    private ActionDocument action;
    private String adresseIp;
    private Boolean integriteValide;
    private String details;
    private LocalDateTime dateAction;
}
