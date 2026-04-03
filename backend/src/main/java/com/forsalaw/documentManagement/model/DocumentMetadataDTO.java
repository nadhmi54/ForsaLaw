package com.forsalaw.documentManagement.model;

import com.forsalaw.documentManagement.entity.ContexteDocument;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentMetadataDTO {
    private String id;
    private String deposeurId;
    private String nomDeposeur;
    private String nomOriginal;
    private String typeContenu;
    private Long tailleFichier;
    private String hashSha256;
    private ContexteDocument contexteType;
    private String contexteId;
    private boolean supprime;
    private LocalDateTime dateCreation;
}
