package com.forsalaw.reclamationManagement.service;

import com.forsalaw.reclamationManagement.entity.*;
import com.forsalaw.reclamationManagement.model.*;
import com.forsalaw.reclamationManagement.repository.*;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.repository.UserRepository;
import com.forsalaw.userManagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReclamationService {

    private final ReclamationRepository reclamationRepository;
    private final ReclamationMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final com.forsalaw.userManagement.repository.IdSequenceRepository idSequenceRepository;

    @jakarta.annotation.PostConstruct
    public void init() {
        int year = java.time.Year.now().getValue();
        if (!idSequenceRepository.existsByEntityTypeAndYear("REC", year)) {
            com.forsalaw.userManagement.entity.IdSequence seq = new com.forsalaw.userManagement.entity.IdSequence();
            seq.setEntityType("REC");
            seq.setYear(year);
            seq.setNextVal(1L);
            idSequenceRepository.save(seq);
        }
    }

    @Transactional
    public ReclamationDTO creerReclamation(String emailUtilisateur, CreateReclamationRequest request) {
        User createur = userRepository.findByEmail(emailUtilisateur)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        Reclamation r = new Reclamation();
        r.setId(userService.generateNextId("REC"));
        r.setCreateur(createur);
        r.setTitre(request.getTitre());
        r.setDescription(request.getDescription());
        r.setCategorie(request.getCategorie());
        r.setGravite(request.getGravite());
        r.setStatut(StatutReclamation.OUVERTE);

        if (request.getUtilisateurCibleId() != null && !request.getUtilisateurCibleId().isBlank()) {
            User cible = userRepository.findById(request.getUtilisateurCibleId())
                    .orElseThrow(() -> new IllegalArgumentException("Utilisateur cible non trouvé"));
            r.setUtilisateurCible(cible);
        }

        r = reclamationRepository.save(r);
        return mapToDTO(r);
    }

    @Transactional(readOnly = true)
    public Page<ReclamationDTO> listerMesReclamations(String emailUtilisateur, StatutReclamation statut, Pageable pageable) {
        User user = userRepository.findByEmail(emailUtilisateur)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        return reclamationRepository.findByCreateurWithFilters(user.getId(), statut, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public ReclamationDTO getDetailReclamation(String emailUtilisateur, String id) {
        Reclamation r = reclamationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Réclamation non trouvée"));

        if (emailUtilisateur != null) {
            User user = userRepository.findByEmail(emailUtilisateur)
                    .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
            
            if (!r.getCreateur().getId().equals(user.getId()) && !user.getRoleUser().name().equalsIgnoreCase("admin")) {
                throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
            }

            if (r.getCreateur().getId().equals(user.getId())) {
                r.setANouvelleNotification(false);
                reclamationRepository.save(r);
            }
        }

        return mapToDTO(r);
    }

    @Transactional
    public ReclamationMessageDTO ajouterMessage(String emailUtilisateur, String reclamationId, String contenu) {
        User expediteur = userRepository.findByEmail(emailUtilisateur)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        Reclamation r = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new IllegalArgumentException("Réclamation non trouvée"));

        if (!r.getCreateur().getId().equals(expediteur.getId()) && !expediteur.getRoleUser().name().equalsIgnoreCase("admin")) {
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
        }

        ReclamationMessage msg = new ReclamationMessage();
        msg.setReclamation(r);
        msg.setExpediteur(expediteur);
        msg.setContenu(contenu);
        msg = messageRepository.save(msg);

        if (expediteur.getRoleUser().name().equalsIgnoreCase("admin")) {
            r.setANouvelleNotification(true);
            r.setDateModification(LocalDateTime.now());
            reclamationRepository.save(r);
        }

        return mapToMessageDTO(msg);
    }

    @Transactional(readOnly = true)
    public Page<ReclamationDTO> listerToutPourAdmin(String createurId, StatutReclamation statut, Pageable pageable) {
        return reclamationRepository.findForAdmin(createurId, statut, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public ReclamationDTO mettreAJourStatut(String id, StatutReclamation statut) {
        Reclamation r = reclamationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Réclamation non trouvée"));
        r.setStatut(statut);
        r.setDateModification(LocalDateTime.now());
        r.setANouvelleNotification(true);
        r = reclamationRepository.save(r);
        return mapToDTO(r);
    }

    @Transactional(readOnly = true)
    public List<ReclamationMessageDTO> getMessages(String emailUtilisateur, String reclamationId) {
        Reclamation r = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new IllegalArgumentException("Réclamation non trouvée"));
        
        if (emailUtilisateur != null) {
            User user = userRepository.findByEmail(emailUtilisateur)
                    .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

            if (!r.getCreateur().getId().equals(user.getId()) && !user.getRoleUser().name().equalsIgnoreCase("admin")) {
                throw new org.springframework.security.access.AccessDeniedException("Accès refusé");
            }
        }

        return messageRepository.findByReclamation_IdOrderByDateEnvoiAsc(reclamationId)
                .stream()
                .map(this::mapToMessageDTO)
                .collect(Collectors.toList());
    }

    private ReclamationDTO mapToDTO(Reclamation r) {
        ReclamationDTO dto = new ReclamationDTO();
        dto.setId(r.getId());
        dto.setCreateurId(r.getCreateur().getId());
        dto.setNomCreateur(r.getCreateur().getNom() + " " + r.getCreateur().getPrenom());
        if (r.getUtilisateurCible() != null) {
            dto.setUtilisateurCibleId(r.getUtilisateurCible().getId());
            dto.setNomUtilisateurCible(r.getUtilisateurCible().getNom() + " " + r.getUtilisateurCible().getPrenom());
        }
        dto.setTitre(r.getTitre());
        dto.setDescription(r.getDescription());
        dto.setCategorie(r.getCategorie());
        dto.setStatut(r.getStatut());
        dto.setGravite(r.getGravite());
        dto.setANouvelleNotification(r.isANouvelleNotification());
        dto.setDateCreation(r.getDateCreation());
        dto.setDateModification(r.getDateModification());
        
        if (r.getAttachments() != null) {
            dto.setPiecesJointes(r.getAttachments().stream()
                    .map(this::mapToAttachmentDTO)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    private ReclamationMessageDTO mapToMessageDTO(ReclamationMessage m) {
        return new ReclamationMessageDTO(
                m.getId(),
                m.getExpediteur().getId(),
                m.getExpediteur().getNom() + " " + m.getExpediteur().getPrenom(),
                m.getContenu(),
                m.getDateEnvoi()
        );
    }

    private ReclamationAttachmentDTO mapToAttachmentDTO(ReclamationAttachment a) {
        return new ReclamationAttachmentDTO(
                a.getId(),
                a.getNomFichier(),
                a.getTypeContenu(),
                a.getTailleFichier(),
                a.getDateEnvoi()
        );
    }
}
