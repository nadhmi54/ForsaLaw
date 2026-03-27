package com.forsalaw.userManagement.service;

import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.entity.UserNotificationPreferences;
import com.forsalaw.userManagement.model.NotificationPreferencesDTO;
import com.forsalaw.userManagement.model.UpdateNotificationPreferencesRequest;
import com.forsalaw.userManagement.repository.UserNotificationPreferencesRepository;
import com.forsalaw.userManagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationPreferencesService {

    private final UserRepository userRepository;
    private final UserNotificationPreferencesRepository preferencesRepository;

    @Transactional(readOnly = true)
    public NotificationPreferencesDTO getForCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouve."));
        return toDTO(ensurePrefs(user));
    }

    @Transactional
    public NotificationPreferencesDTO updateForCurrentUser(String email, UpdateNotificationPreferencesRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouve."));
        UserNotificationPreferences p = ensurePrefs(user);
        if (request.getEmailRdvDemandeRecue() != null) {
            p.setEmailRdvDemandeRecue(request.getEmailRdvDemandeRecue());
        }
        if (request.getEmailRdvCreneauPropose() != null) {
            p.setEmailRdvCreneauPropose(request.getEmailRdvCreneauPropose());
        }
        if (request.getEmailRdvRappelJ1() != null) {
            p.setEmailRdvRappelJ1(request.getEmailRdvRappelJ1());
        }
        if (request.getEmailRdvRappelH1() != null) {
            p.setEmailRdvRappelH1(request.getEmailRdvRappelH1());
        }
        if (request.getEmailRdvAnnulation() != null) {
            p.setEmailRdvAnnulation(request.getEmailRdvAnnulation());
        }
        preferencesRepository.save(p);
        return toDTO(p);
    }

    private UserNotificationPreferences ensurePrefs(User user) {
        return preferencesRepository.findById(user.getId()).orElseGet(() -> {
            UserNotificationPreferences p = new UserNotificationPreferences();
            p.setUser(user);
            return preferencesRepository.save(p);
        });
    }

    private NotificationPreferencesDTO toDTO(UserNotificationPreferences p) {
        return new NotificationPreferencesDTO(
                p.isEmailRdvDemandeRecue(),
                p.isEmailRdvCreneauPropose(),
                p.isEmailRdvRappelJ1(),
                p.isEmailRdvRappelH1(),
                p.isEmailRdvAnnulation()
        );
    }
}
