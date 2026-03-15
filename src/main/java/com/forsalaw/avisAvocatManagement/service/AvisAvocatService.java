package com.forsalaw.avisAvocatManagement.service;

import com.forsalaw.avisAvocatManagement.entity.AvisAvocat;
import com.forsalaw.avisAvocatManagement.model.AvisAvocatDTO;
import com.forsalaw.avisAvocatManagement.model.CreateAvisRequest;
import com.forsalaw.avisAvocatManagement.repository.AvisAvocatRepository;
import com.forsalaw.avocatManagement.entity.Avocat;
import com.forsalaw.avocatManagement.repository.AvocatRepository;
import com.forsalaw.userManagement.entity.RoleUser;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.repository.UserRepository;
import com.forsalaw.userManagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AvisAvocatService {

    private final AvisAvocatRepository avisAvocatRepository;
    private final AvocatRepository avocatRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public AvisAvocatDTO create(String userEmail, String avocatId, CreateAvisRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        if (user.getRoleUser() != RoleUser.client) {
            throw new IllegalArgumentException("Seuls les clients peuvent laisser un avis.");
        }
        Avocat avocat = avocatRepository.findById(avocatId)
                .orElseThrow(() -> new IllegalArgumentException("Avocat non trouvé."));
        if (!avocat.isActif()) {
            throw new IllegalArgumentException("Avocat non trouvé.");
        }
        if (avisAvocatRepository.existsByUserIdAndAvocatId(user.getId(), avocatId)) {
            throw new IllegalArgumentException("Vous avez déjà laissé un avis pour cet avocat.");
        }
        AvisAvocat avis = new AvisAvocat();
        avis.setId(userService.generateNextId("AVI"));
        avis.setUser(user);
        avis.setAvocat(avocat);
        avis.setNote(request.getNote());
        avis.setCommentaire(request.getCommentaire() != null ? request.getCommentaire().trim() : null);
        avis = avisAvocatRepository.save(avis);
        updateNoteMoyenne(avocatId);
        return toDTO(avis);
    }

    public Page<AvisAvocatDTO> findByAvocatId(String avocatId, Pageable pageable) {
        if (!avocatRepository.existsById(avocatId)) {
            throw new IllegalArgumentException("Avocat non trouvé.");
        }
        return avisAvocatRepository.findByAvocatIdOrderByDateCreationDesc(avocatId, pageable)
                .map(this::toDTO);
    }

    private void updateNoteMoyenne(String avocatId) {
        double moyenne = avisAvocatRepository.getNoteMoyenneByAvocatId(avocatId);
        Avocat avocat = avocatRepository.findById(avocatId).orElseThrow();
        avocat.setNoteMoyenne(moyenne);
        avocatRepository.save(avocat);
    }

    private AvisAvocatDTO toDTO(AvisAvocat a) {
        AvisAvocatDTO dto = new AvisAvocatDTO();
        dto.setId(a.getId());
        dto.setUserId(a.getUser().getId());
        dto.setUserNom(a.getUser().getNom());
        dto.setUserPrenom(a.getUser().getPrenom());
        dto.setAvocatId(a.getAvocat().getId());
        dto.setNote(a.getNote());
        dto.setCommentaire(a.getCommentaire());
        dto.setDateCreation(a.getDateCreation());
        return dto;
    }
}
