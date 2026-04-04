package com.forsalaw.affaireManagement.service;

import com.forsalaw.affaireManagement.entity.Affaire;
import com.forsalaw.affaireManagement.entity.StatutAffaire;
import com.forsalaw.affaireManagement.model.AffaireDTO;
import com.forsalaw.affaireManagement.model.CreateAffaireRequest;
import com.forsalaw.affaireManagement.model.UpdateStatutRequest;
import com.forsalaw.affaireManagement.repository.AffaireRepository;
import com.forsalaw.avocatManagement.entity.Avocat;
import com.forsalaw.avocatManagement.repository.AvocatRepository;
import com.forsalaw.notificationManagement.service.NotificationService;
import com.forsalaw.reclamationManagement.entity.Reclamation;
import com.forsalaw.reclamationManagement.repository.ReclamationRepository;
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

    private final AffaireRepository affaireRepository;
    private final UserRepository userRepository;
    private final AvocatRepository avocatRepository;
    private final ReclamationRepository reclamationRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    // ─── Création ─────────────────────────────────────────────────────────────

    @Transactional
    public AffaireDTO creerAffaire(CreateAffaireRequest request) {
        User client = userRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client introuvable."));

        Affaire affaire = new Affaire();
        affaire.setId(userService.generateNextId("AFF"));
        affaire.setTitre(request.getTitre());
        affaire.setDescription(request.getDescription());
        affaire.setType(request.getType());
        affaire.setStatut(StatutAffaire.INSTRUCTION);
        affaire.setClient(client);
        affaire.setDateProchaineAudience(request.getDateProchaineAudience());

        if (request.getAvocatId() != null) {
            Avocat avocat = avocatRepository.findById(request.getAvocatId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avocat introuvable."));
            affaire.setAvocat(avocat);
        }

        if (request.getReclamationId() != null) {
            Reclamation reclamation = reclamationRepository.findById(request.getReclamationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réclamation introuvable."));
            affaire.setReclamation(reclamation);
        }

        affaire = affaireRepository.save(affaire);
        log.info("Affaire créée : {} pour client {}", affaire.getId(), client.getEmail());
        return toDTO(affaire, true);
    }

    // ─── Consultation ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AffaireDTO getAffaire(String affaireId, String emailActeur) {
        Affaire affaire = requireAffaire(affaireId);
        User acteur = requireUser(emailActeur);
        assertAcces(acteur, affaire);
        boolean isPrivileged = acteur.getRoleUser() == RoleUser.admin
                || (affaire.getAvocat() != null && affaire.getAvocat().getUser().getEmail().equals(emailActeur));
        return toDTO(affaire, isPrivileged);
    }

    @Transactional(readOnly = true)
    public Page<AffaireDTO> mesAffaires(String email, Pageable pageable) {
        User user = requireUser(email);
        Page<Affaire> page;
        if (user.getRoleUser() == RoleUser.avocat) {
            Avocat avocat = avocatRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profil avocat introuvable."));
            page = affaireRepository.findByAvocat_Id(avocat.getId(), pageable);
        } else {
            page = affaireRepository.findByClient_Id(user.getId(), pageable);
        }
        return page.map(a -> toDTO(a, user.getRoleUser() == RoleUser.avocat));
    }

    @Transactional(readOnly = true)
    public Page<AffaireDTO> toutesLesAffaires(StatutAffaire statut, Pageable pageable) {
        Page<Affaire> page = (statut != null)
                ? affaireRepository.findByStatut(statut, pageable)
                : affaireRepository.findAll(pageable);
        return page.map(a -> toDTO(a, true));
    }

    // ─── Mise à jour statut ───────────────────────────────────────────────────

    @Transactional
    public AffaireDTO changerStatut(String affaireId, UpdateStatutRequest request, String emailActeur) {
        Affaire affaire = requireAffaire(affaireId);
        User acteur = requireUser(emailActeur);

        // Seul avocat assigné ou admin peut changer le statut
        boolean isAdmin = acteur.getRoleUser() == RoleUser.admin;
        boolean isAvocatAssigne = affaire.getAvocat() != null
                && affaire.getAvocat().getUser().getEmail().equals(emailActeur);
        if (!isAdmin && !isAvocatAssigne) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seul l'avocat assigné ou un admin peut modifier le statut.");
        }

        StatutAffaire ancienStatut = affaire.getStatut();
        affaire.setStatut(request.getStatut());

        if (request.getDateProchaineAudience() != null) {
            affaire.setDateProchaineAudience(request.getDateProchaineAudience());
        }
        if (request.getNotesInternes() != null) {
            affaire.setNotesInternes(request.getNotesInternes());
        }
        if (request.getStatut() == StatutAffaire.CLOS) {
            affaire.setDateCloture(java.time.LocalDateTime.now());
        }

        affaire = affaireRepository.save(affaire);
        log.info("Affaire {} : statut {} -> {}", affaireId, ancienStatut, request.getStatut());

        // Notification WhatsApp/Email au client
        notificationService.notifierChangementStatutAffaire(affaire);

        return toDTO(affaire, true);
    }

    // ─── Assigner un avocat ───────────────────────────────────────────────────

    @Transactional
    public AffaireDTO assignerAvocat(String affaireId, String avocatId) {
        Affaire affaire = requireAffaire(affaireId);
        Avocat avocat = avocatRepository.findById(avocatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avocat introuvable."));
        affaire.setAvocat(avocat);
        affaire = affaireRepository.save(affaire);
        log.info("Avocat {} assigné à l'affaire {}", avocatId, affaireId);
        return toDTO(affaire, true);
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

    private void assertAcces(User acteur, Affaire affaire) {
        if (acteur.getRoleUser() == RoleUser.admin) return;
        boolean isClient = affaire.getClient().getId().equals(acteur.getId());
        boolean isAvocat = affaire.getAvocat() != null
                && affaire.getAvocat().getUser().getId().equals(acteur.getId());
        if (!isClient && !isAvocat) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }
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
