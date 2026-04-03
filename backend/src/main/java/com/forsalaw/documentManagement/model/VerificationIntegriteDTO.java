package com.forsalaw.documentManagement.model;

import com.forsalaw.documentManagement.entity.ContexteDocument;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerificationIntegriteDTO {
    /** Hash recalculé au moment de la vérification. */
    private String hashActuel;
    /** Hash stocké lors de l'upload (le sceau original). */
    private String hashOriginal;
    /** true si le document n'a pas été modifié depuis son dépôt. */
    private boolean integreite;
    private String documentId;
    private String nomFichier;
}
