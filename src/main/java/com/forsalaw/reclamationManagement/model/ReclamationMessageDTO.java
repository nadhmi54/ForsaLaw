package com.forsalaw.reclamationManagement.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReclamationMessageDTO {
    private Long id;
    private String expediteurId;
    private String nomExpediteur;
    private String contenu;
    private LocalDateTime dateEnvoi;
}
