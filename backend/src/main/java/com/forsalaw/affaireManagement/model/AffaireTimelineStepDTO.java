package com.forsalaw.affaireManagement.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AffaireTimelineStepDTO {
    private String id;
    private String statusLabel;
    private boolean completed;
    private boolean active;
    /** When this milestone was reached (null for future/pending steps). */
    private LocalDateTime occurredAt;
}
