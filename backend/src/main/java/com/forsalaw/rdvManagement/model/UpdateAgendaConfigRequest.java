package com.forsalaw.rdvManagement.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAgendaConfigRequest {

    private String zoneId;
    private Integer dureeCreneauMinutes;
    private Integer bufferMinutes;
    private Boolean agendaActif;
}
