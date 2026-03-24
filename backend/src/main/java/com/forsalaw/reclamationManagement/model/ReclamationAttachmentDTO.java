package com.forsalaw.reclamationManagement.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReclamationAttachmentDTO {
    private Long id;
    private String nomFichier;
    private String typeContenu;
    private Long tailleFichier;
    private LocalDateTime dateEnvoi;
}
