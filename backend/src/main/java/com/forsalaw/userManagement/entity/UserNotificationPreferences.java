package com.forsalaw.userManagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Préférences de notification (email RDV). Opt-in par type.
 */
@Entity
@Table(name = "user_notification_preferences")
@Getter
@Setter
public class UserNotificationPreferences {

    @Id
    @Column(name = "user_id", length = 20)
    private String userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "email_rdv_demande_recue", nullable = false)
    private boolean emailRdvDemandeRecue = true;

    @Column(name = "email_rdv_creneau_propose", nullable = false)
    private boolean emailRdvCreneauPropose = true;

    @Column(name = "email_rdv_rappel_j1", nullable = false)
    private boolean emailRdvRappelJ1 = true;

    @Column(name = "email_rdv_rappel_h1", nullable = false)
    private boolean emailRdvRappelH1 = true;

    @Column(name = "email_rdv_annulation", nullable = false)
    private boolean emailRdvAnnulation = true;
}
