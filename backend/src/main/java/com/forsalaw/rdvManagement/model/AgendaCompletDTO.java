package com.forsalaw.rdvManagement.model;

import java.util.List;

public record AgendaCompletDTO(
        String zoneId,
        int dureeCreneauMinutes,
        int bufferMinutes,
        boolean agendaActif,
        List<PlageRecurrenteDTO> plages,
        List<AgendaExceptionDTO> exceptions
) {}
