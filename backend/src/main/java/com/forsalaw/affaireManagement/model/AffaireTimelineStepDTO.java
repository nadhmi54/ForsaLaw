package com.forsalaw.affaireManagement.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AffaireTimelineStepDTO {
    private String id;
    private String statusLabel;
    private boolean completed;
    private boolean active;
}
