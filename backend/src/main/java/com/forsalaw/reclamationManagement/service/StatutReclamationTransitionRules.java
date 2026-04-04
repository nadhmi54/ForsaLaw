package com.forsalaw.reclamationManagement.service;

import com.forsalaw.reclamationManagement.entity.StatutReclamation;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Graphe des changements de statut autorisés pour une réclamation (côté admin).
 */
public final class StatutReclamationTransitionRules {

    private static final EnumMap<StatutReclamation, Set<StatutReclamation>> AUTORISE = new EnumMap<>(StatutReclamation.class);

    static {
        AUTORISE.put(StatutReclamation.OUVERTE, EnumSet.of(StatutReclamation.EN_COURS, StatutReclamation.REJETEE));
        AUTORISE.put(StatutReclamation.EN_COURS, EnumSet.of(StatutReclamation.TRAITEE, StatutReclamation.REJETEE));
        AUTORISE.put(StatutReclamation.TRAITEE, EnumSet.noneOf(StatutReclamation.class));
        AUTORISE.put(StatutReclamation.REJETEE, EnumSet.noneOf(StatutReclamation.class));
    }

    private StatutReclamationTransitionRules() {}

    public static void verifier(StatutReclamation actuel, StatutReclamation cible) {
        if (actuel == cible) {
            return;
        }
        Set<StatutReclamation> cibles = AUTORISE.get(actuel);
        if (cibles != null && cibles.contains(cible)) {
            return;
        }
        throw new IllegalArgumentException(message(actuel, cible, cibles));
    }

    private static String message(StatutReclamation actuel, StatutReclamation cible, Set<StatutReclamation> cibles) {
        if (cibles == null || cibles.isEmpty()) {
            return String.format(
                    "Transition de statut interdite : %s → %s. Le statut %s est final (aucune transition sortante).",
                    actuel, cible, actuel);
        }
        String liste = cibles.stream().map(Enum::name).collect(Collectors.joining(", "));
        return String.format(
                "Transition de statut interdite : %s → %s. Statuts autorisés depuis %s : %s.",
                actuel, cible, actuel, liste);
    }
}
