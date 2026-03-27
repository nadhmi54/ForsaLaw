package com.forsalaw.rdvManagement.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class CreatePlageRecurrenteRequest {

    /** 1 = lundi … 7 = dimanche (ISO-8601) */
    private Integer dayOfWeek;
    private LocalTime heureDebut;
    private LocalTime heureFin;
}
