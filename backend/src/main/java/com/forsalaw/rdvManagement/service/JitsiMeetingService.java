package com.forsalaw.rdvManagement.service;

import com.forsalaw.rdvManagement.entity.RendezVous;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class JitsiMeetingService {

    @Value("${forsalaw.rdv.jitsi-base-url:https://meet.jit.si}")
    private String jitsiBaseUrl;

    public String generateMeetingUrl(RendezVous rdv) {
        String safeBaseUrl = trimTrailingSlash(jitsiBaseUrl);
        String roomName = "forsalaw-" + rdv.getIdRendezVous() + "-" + UUID.randomUUID().toString().substring(0, 8);
        return safeBaseUrl + "/" + roomName;
    }

    private String trimTrailingSlash(String url) {
        if (url == null || url.isBlank()) {
            return "https://meet.jit.si";
        }
        String t = url.trim();
        while (t.endsWith("/")) {
            t = t.substring(0, t.length() - 1);
        }
        return t;
    }
}
