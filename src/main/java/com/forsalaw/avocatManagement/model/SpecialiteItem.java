package com.forsalaw.avocatManagement.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Élément de liste des spécialités juridiques (code enum + libellé français).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SpecialiteItem {
    /** Code de l'enum (ex. DROIT_CIVIL, travail). */
    private String code;
    /** Libellé en français pour l'affichage. */
    private String libelle;
}
