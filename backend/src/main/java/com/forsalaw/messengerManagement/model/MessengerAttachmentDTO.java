package com.forsalaw.messengerManagement.model;

import com.forsalaw.messengerManagement.entity.AttachmentScanStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessengerAttachmentDTO {

    private String id;
    private String originalFilename;
    private String contentType;
    private long sizeBytes;
    private AttachmentScanStatus scanStatus;
    /**
     * URL complete GET avec jeton temporaire (query {@code token}) pour telecharger sans re-saisir le Bearer.
     */
    private String downloadUrl;
}
