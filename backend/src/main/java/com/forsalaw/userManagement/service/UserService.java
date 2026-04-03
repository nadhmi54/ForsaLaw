package com.forsalaw.userManagement.service;

import com.forsalaw.userManagement.entity.IdSequence;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.model.AdminUpdateUserRequest;
import com.forsalaw.userManagement.model.UpdateUserRequest;
import com.forsalaw.userManagement.model.UserDTO;
import com.forsalaw.userManagement.repository.IdSequenceRepository;
import com.forsalaw.userManagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final IdSequenceRepository idSequenceRepository;
    private final PasswordEncoder passwordEncoder;

    /** Génère le prochain ID au format AAAA-XXX-NNNNN (ex: 2025-USR-00001). */
    @Transactional
    public String generateNextId(String prefix) {
        int year = LocalDate.now().getYear();
        var seq = idSequenceRepository.findByEntityTypeAndYearForUpdate(prefix, year);
        long nextVal;
        if (seq.isEmpty()) {
            IdSequence newSeq = new IdSequence();
            newSeq.setEntityType(prefix);
            newSeq.setYear(year);
            newSeq.setNextVal(2); // prochain numéro à attribuer
            idSequenceRepository.save(newSeq);
            nextVal = 1; // premier id de l'année
        } else {
            IdSequence s = seq.get();
            nextVal = s.getNextVal();
            s.setNextVal(nextVal + 1);
            idSequenceRepository.save(s);
        }
        return year + "-" + prefix + "-" + String.format("%05d", nextVal);
    }

    public UserDTO getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        return toDTO(user);
    }

    @Transactional
    public UserDTO updateProfile(String currentEmail, UpdateUserRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));

        if (request.getNom() != null && !request.getNom().isBlank()) {
            user.setNom(request.getNom());
        }
        if (request.getPrenom() != null && !request.getPrenom().isBlank()) {
            user.setPrenom(request.getPrenom());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equals(currentEmail)) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Cet email est déjà utilisé.");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getNouveauMotDePasse() != null && !request.getNouveauMotDePasse().isBlank()) {
            if (request.getMotDePasseActuel() == null || request.getMotDePasseActuel().isBlank()) {
                throw new IllegalArgumentException("Le mot de passe actuel est requis pour changer le mot de passe.");
            }
            if (!passwordEncoder.matches(request.getMotDePasseActuel(), user.getMotDePasse())) {
                throw new IllegalArgumentException("Le mot de passe actuel est incorrect.");
            }
            user.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        }

        user = userRepository.save(user);
        return toDTO(user);
    }

    public Page<UserDTO> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<UserDTO> findAll(Pageable pageable, String search) {
        if (search == null || search.isBlank()) {
            return userRepository.findAll(pageable).map(this::toDTO);
        }
        return userRepository.searchByNomOrPrenomOrEmail(search.trim(), pageable).map(this::toDTO);
    }

    public UserDTO getById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        return toDTO(user);
    }

    @Transactional
    public UserDTO updateByAdmin(String id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));

        if (request.getNom() != null && !request.getNom().isBlank()) {
            user.setNom(request.getNom());
        }
        if (request.getPrenom() != null && !request.getPrenom().isBlank()) {
            user.setPrenom(request.getPrenom());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Cet email est déjà utilisé.");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getRoleUser() != null) {
            user.setRoleUser(request.getRoleUser());
        }
        if (request.getActif() != null) {
            user.setActif(request.getActif());
        }
        if (request.getNouveauMotDePasse() != null && !request.getNouveauMotDePasse().isBlank()) {
            user.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        }

        user = userRepository.save(user);
        return toDTO(user);
    }

    @Transactional
    public void deactivateMyAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        user.setActif(false);
        userRepository.save(user);
    }

    @Transactional
    public void deactivateByAdmin(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        user.setActif(false);
        userRepository.save(user);
    }

    @Transactional
    public void deactivateByAdminEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec cet email."));
        user.setActif(false);
        userRepository.save(user);
    }

    @Transactional
    public void reactivateByAdmin(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        user.setActif(true);
        user.setFailedLoginAttempts(0);
        user.setBlockedByFailedAttempts(false);
        userRepository.save(user);
    }

    @Transactional
    public void reactivateByAdminEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec cet email."));
        user.setActif(true);
        user.setFailedLoginAttempts(0);
        user.setBlockedByFailedAttempts(false);
        userRepository.save(user);
    }

    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setRoleUser(user.getRoleUser());
        dto.setActif(user.isActif());
        dto.setDateCreation(user.getDateCreation());
        dto.setDateMiseAJour(user.getDateMiseAJour());
        return dto;
    }
}
