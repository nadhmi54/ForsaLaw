package com.forsalaw.affaireManagement.service;

import com.forsalaw.affaireManagement.entity.Affaire;
import com.forsalaw.affaireManagement.entity.StatutAffaire;
import com.forsalaw.affaireManagement.entity.TypeAffaire;
import com.forsalaw.affaireManagement.model.AffaireDTO;
import com.forsalaw.affaireManagement.repository.AffaireRepository;
import com.forsalaw.rdvManagement.entity.RendezVous;
import com.forsalaw.rdvManagement.entity.StatutRendezVous;
import com.forsalaw.userManagement.entity.RoleUser;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.repository.UserRepository;
import com.forsalaw.userManagement.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AffaireService {

    private static final int TITRE_MAX = 250;

    private final AffaireRepository affaireRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    /**
     * Appelé lorsque le RDV passe à {@link StatutRendezVous#CONFIRME} (client a accepté la proposition de l'avocat).
     * Une seule affaire par RDV.
     */
    @Transactional
    public void creerAffaireSiRendezVousConfirme(RendezVous rdv) {
        if (rdv.getStatutRendezVous() != StatutRendezVous.CONFIRME) {
            return;
        }
        if (affaireRepository.existsByRendezVous_IdRendezVous(rdv.getIdRendezVous())) {
            return;
        }

        Affaire affaire = new Affaire();
        affaire.setId(userService.generateNextId("AFF"));
        affaire.setTitre(buildTitreDepuisRdv(rdv));
        affaire.setDescription(rdv.getMotifConsultation());
        affaire.setType(TypeAffaire.CIVIL);
        affaire.setStatut(StatutAffaire.INSTRUCTION);
        affaire.setClient(rdv.getClient());
        affaire.setAvocat(rdv.getAvocat());
        affaire.setRendezVous(rdv);
        affaire.setDateProchaineAudience(rdv.getDateHeureDebut());

        affaireRepository.save(affaire);
        log.info("Affaire {} ouverte automatiquement depuis RDV confirme {}", affaire.getId(), rdv.getIdRendezVous());
    }

    private static String buildTitreDepuisRdv(RendezVous rdv) {
        String motif = rdv.getMotifConsultation();
        if (motif != null && !motif.isBlank()) {
            String t = motif.trim();
            if (t.length() > TITRE_MAX) {
                return t.substring(0, TITRE_MAX - 1) + "…";
            }
            return t;
        }
        return "Consultation — RDV " + rdv.getIdRendezVous();
    }

    // ─── Consultation (admin uniquement) ───────────────────────────────────────

    @Transactional(readOnly = true)
    public AffaireDTO getAffairePourAdmin(String affaireId, String emailActeur) {
        assertAdmin(requireUser(emailActeur));
        Affaire affaire = requireAffaire(affaireId);
        return toDTO(affaire, true);
    }

    @Transactional(readOnly = true)
    public Page<AffaireDTO> toutesLesAffaires(StatutAffaire statut, Pageable pageable) {
        Page<Affaire> page = (statut != null)
                ? affaireRepository.findByStatut(statut, pageable)
                : affaireRepository.findAll(pageable);
        return page.map(a -> toDTO(a, true));
    }

    // ─── Utilitaires privés ───────────────────────────────────────────────────

    private Affaire requireAffaire(String id) {
        return affaireRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Affaire introuvable."));
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu."));
    }

    private static void assertAdmin(User acteur) {
        if (acteur.getRoleUser() != RoleUser.admin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acces reserve aux administrateurs.");
        }
    }

    // ─── Timeline (Métier avancée) ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public java.util.List<com.forsalaw.affaireManagement.model.AffaireTimelineStepDTO> getTimelinePourAdmin(String affaireId, String emailActeur) {
        assertAdmin(requireUser(emailActeur));
        Affaire affaire = requireAffaire(affaireId);
        return genererTimeline(affaire.getStatut());
    }

    private java.util.List<com.forsalaw.affaireManagement.model.AffaireTimelineStepDTO> genererTimeline(StatutAffaire statutActuel) {
        StatutAffaire[] ordre = {
            StatutAffaire.INSTRUCTION,
            StatutAffaire.AUDIENCE,
            StatutAffaire.DELIBERE,
            StatutAffaire.JUGEMENT,
            StatutAffaire.APPEL,
            StatutAffaire.CLOS
        };
        
        java.util.List<com.forsalaw.affaireManagement.model.AffaireTimelineStepDTO> timeline = new java.util.ArrayList<>();
        boolean foundCurrent = false;
        
        for (int i = 0; i < ordre.length; i++) {
            StatutAffaire s = ordre[i];
            boolean active = (s == statutActuel);
            if (active) foundCurrent = true;
            boolean completed = !foundCurrent && !active;
            
            timeline.add(new com.forsalaw.affaireManagement.model.AffaireTimelineStepDTO(
                "STEP_" + (i + 1),
                s.name(),
                completed,
                active
            ));
        }
        return timeline;
    }

    private AffaireDTO toDTO(Affaire a, boolean includePrivate) {
        AffaireDTO dto = new AffaireDTO();
        dto.setId(a.getId());
        dto.setTitre(a.getTitre());
        dto.setDescription(a.getDescription());
        dto.setType(a.getType());
        dto.setStatut(a.getStatut());
        dto.setClientId(a.getClient().getId());
        dto.setClientNom(a.getClient().getPrenom() + " " + a.getClient().getNom());
        if (a.getAvocat() != null) {
            dto.setAvocatId(a.getAvocat().getId());
            dto.setAvocatNom(a.getAvocat().getUser().getPrenom() + " " + a.getAvocat().getUser().getNom());
        }
        if (a.getReclamation() != null) {
            dto.setReclamationId(a.getReclamation().getId());
        }
        if (a.getRendezVous() != null) {
            dto.setRendezVousId(a.getRendezVous().getIdRendezVous());
        }
        dto.setDateProchaineAudience(a.getDateProchaineAudience());
        dto.setDateOuverture(a.getDateOuverture());
        dto.setDateMiseAJour(a.getDateMiseAJour());
        dto.setDateCloture(a.getDateCloture());
        if (includePrivate) {
            dto.setNotesInternes(a.getNotesInternes());
        }
        return dto;
    }
}
