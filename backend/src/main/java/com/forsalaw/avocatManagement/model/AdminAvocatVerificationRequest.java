package com.forsalaw.avocatManagement.model;

import com.forsalaw.avocatManagement.entity.AvocatVerificationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Décision admin : {@code verificationStatus} + {@code verifie} (cohérents : APPROVED avec true, sinon false).
 */
@Getter
@Setter
public class AdminAvocatVerificationRequest {

    @NotNull(message = "Le statut de verification est requis.")
    @Schema(description = "APPROVED = accepte, REJECTED = refus, PENDING = en attente")
    private AvocatVerificationStatus verificationStatus;

    @NotNull(message = "Le champ verifie est requis.")
    @Schema(description = "true si le profil est valide (acces espace avocat), false sinon — doit correspondre au statut (true uniquement avec APPROVED).")
    private Boolean verifie;
}
