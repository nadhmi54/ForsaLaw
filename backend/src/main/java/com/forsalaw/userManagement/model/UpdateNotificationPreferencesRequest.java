package com.forsalaw.userManagement.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateNotificationPreferencesRequest {

    private Boolean emailRdvDemandeRecue;
    private Boolean emailRdvCreneauPropose;
    private Boolean emailRdvRappelJ1;
    private Boolean emailRdvRappelH1;
    private Boolean emailRdvAnnulation;
}
