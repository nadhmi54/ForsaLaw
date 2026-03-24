package com.forsalaw.avocatManagement.service;

import com.forsalaw.avocatManagement.entity.Avocat;
import com.forsalaw.avocatManagement.entity.SpecialiteJuridique;
import com.forsalaw.avocatManagement.model.*;
import com.forsalaw.avocatManagement.repository.AvocatRepository;
import com.forsalaw.userManagement.entity.RoleUser;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.service.UserService;
import com.forsalaw.userManagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AvocatService {

    private final AvocatRepository avocatRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public AvocatDTO createProfile(String userEmail, CreateAvocatRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        if (user.getRoleUser() != RoleUser.avocat) {
            throw new IllegalArgumentException("Seul un utilisateur avec le rôle avocat peut créer un profil avocat.");
        }
        if (avocatRepository.existsByUserId(user.getId())) {
            throw new IllegalArgumentException("Un profil avocat existe déjà pour ce compte.");
        }
        if (request.getDomaine() == null) {
            throw new IllegalArgumentException("Le domaine du droit est requis lors de la création du profil.");
        }
        if (request.getSpecialite() == null) {
            throw new IllegalArgumentException("La spécialité (sous-domaine) est requise lors de la création du profil.");
        }
        if (request.getSpecialite().getDomaine() != request.getDomaine()) {
            throw new IllegalArgumentException("La spécialité choisie doit appartenir au domaine sélectionné. Domaine choisi : " + request.getDomaine().getLibelle() + ".");
        }
        Avocat avocat = new Avocat();
        avocat.setId(userService.generateNextId("AVC"));
        avocat.setUser(user);
        avocat.setSpecialite(request.getSpecialite());
        avocat.setAnneesExperience(request.getAnneesExperience());
        avocat.setVille(request.getVille() != null ? request.getVille() : "");
        avocat.setDescription(request.getDescription());
        avocat = avocatRepository.save(avocat);
        return toDTO(avocat);
    }

    @Transactional(readOnly = true)
    public AvocatDTO getMyProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        Avocat avocat = avocatRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profil avocat non trouvé."));
        return toDTO(avocat);
    }

    @Transactional
    public AvocatDTO updateMyProfile(String userEmail, UpdateAvocatRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        Avocat avocat = avocatRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profil avocat non trouvé."));
        if (request.getSpecialite() != null) avocat.setSpecialite(request.getSpecialite());
        if (request.getAnneesExperience() != null) avocat.setAnneesExperience(request.getAnneesExperience());
        if (request.getVille() != null) avocat.setVille(request.getVille());
        if (request.getDescription() != null) avocat.setDescription(request.getDescription());
        avocat = avocatRepository.save(avocat);
        return toDTO(avocat);
    }

    @Transactional
    public void deactivateMyProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        Avocat avocat = avocatRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profil avocat non trouvé."));
        avocat.setActif(false);
        avocatRepository.save(avocat);
    }

    public Page<AvocatDTO> findAllPublic(Pageable pageable, SpecialiteJuridique specialite, String ville, Boolean verifie) {
        return avocatRepository.findAllActifsFiltered(specialite, ville != null ? ville.trim() : null, verifie, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public AvocatDTO getById(String id) {
        Avocat avocat = avocatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Avocat non trouvé."));
        if (!avocat.isActif()) {
            throw new IllegalArgumentException("Avocat non trouvé.");
        }
        return toDTO(avocat);
    }

    public Page<AvocatDTO> findAllAdmin(Pageable pageable, SpecialiteJuridique specialite, String ville, Boolean verifie, Boolean actif) {
        return avocatRepository.findAllFiltered(specialite, ville != null ? ville.trim() : null, verifie, actif, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public AvocatDTO getByIdAdmin(String id) {
        Avocat avocat = avocatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Avocat non trouvé."));
        return toDTO(avocat);
    }

    @Transactional
    public AvocatDTO updateByAdmin(String id, AdminUpdateAvocatRequest request) {
        Avocat avocat = avocatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Avocat non trouvé."));
        if (request.getSpecialite() != null) avocat.setSpecialite(request.getSpecialite());
        if (request.getAnneesExperience() != null) avocat.setAnneesExperience(request.getAnneesExperience());
        if (request.getVille() != null) avocat.setVille(request.getVille());
        if (request.getDescription() != null) avocat.setDescription(request.getDescription());
        if (request.getVerifie() != null) avocat.setVerifie(request.getVerifie());
        if (request.getActif() != null) avocat.setActif(request.getActif());
        avocat = avocatRepository.save(avocat);
        return toDTO(avocat);
    }

    @Transactional
    public void deactivateByAdmin(String id) {
        Avocat avocat = avocatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Avocat non trouvé."));
        avocat.setActif(false);
        avocatRepository.save(avocat);
    }

    @Transactional
    public void deactivateByAdminEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec cet email."));
        Avocat avocat = avocatRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Aucun profil avocat associé à cet email."));
        avocat.setActif(false);
        avocatRepository.save(avocat);
    }

    @Transactional
    public void reactivateByAdmin(String id) {
        Avocat avocat = avocatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Avocat non trouvé."));
        avocat.setActif(true);
        avocatRepository.save(avocat);
    }

    @Transactional
    public void reactivateByAdminEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec cet email."));
        Avocat avocat = avocatRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Aucun profil avocat associé à cet email."));
        avocat.setActif(true);
        avocatRepository.save(avocat);
    }

    private AvocatDTO toDTO(Avocat a) {
        AvocatDTO dto = new AvocatDTO();
        dto.setId(a.getId());
        dto.setUserId(a.getUser().getId());
        dto.setUserNom(a.getUser().getNom());
        dto.setUserPrenom(a.getUser().getPrenom());
        dto.setUserEmail(a.getUser().getEmail());
        dto.setSpecialite(a.getSpecialite());
        if (a.getSpecialite() != null) {
            dto.setSpecialiteLibelle(a.getSpecialite().getLibelle());
            dto.setDomaine(a.getSpecialite().getDomaine());
            dto.setDomaineLibelle(a.getSpecialite().getDomaine().getLibelle());
        } else {
            dto.setSpecialiteLibelle(null);
            dto.setDomaine(null);
            dto.setDomaineLibelle(null);
        }
        dto.setAnneesExperience(a.getAnneesExperience());
        dto.setVille(a.getVille());
        dto.setDescription(a.getDescription());
        dto.setNoteMoyenne(a.getNoteMoyenne());
        dto.setTotalDossiers(a.getTotalDossiers());
        dto.setVerifie(a.isVerifie());
        dto.setActif(a.isActif());
        dto.setDateCreation(a.getDateCreation());
        dto.setDateMiseAJour(a.getDateMiseAJour());
        return dto;
    }
}
