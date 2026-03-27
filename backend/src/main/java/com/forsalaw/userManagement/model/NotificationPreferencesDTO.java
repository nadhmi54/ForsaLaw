package com.forsalaw.userManagement.model;

public record NotificationPreferencesDTO(
        boolean emailRdvDemandeRecue,
        boolean emailRdvCreneauPropose,
        boolean emailRdvRappelJ1,
        boolean emailRdvRappelH1,
        boolean emailRdvAnnulation
) {}
