package com.forsalaw.rdvManagement.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RendezVousMeetingAccessDTO {
    private String idRendezVous;
    private String roomCode;
    private String joinPath;
}
