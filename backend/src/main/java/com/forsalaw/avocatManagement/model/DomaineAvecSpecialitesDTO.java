package com.forsalaw.avocatManagement.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Un domaine du droit avec la liste de ses spécialités (sous-domaines).
 * Utilisé pour GET /api/avocats/domaines (hiérarchie pour Swagger / frontend).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DomaineAvecSpecialitesDTO {
    /** Code du domaine (enum). */
    private String code;
    /** Libellé du domaine en français. */
    private String libelle;
    /** Liste des spécialités (sous-domaines) de ce domaine. */
    private List<SpecialiteItem> specialites;
}
