package com.forsalaw.rdvManagement.model;

import java.util.List;

public record CreneauxDisponiblesResponse(
        String zoneId,
        int dureeCreneauMinutes,
        int bufferMinutes,
        boolean agendaActif,
        List<CreneauDisponibleDTO> creneaux
) {}
