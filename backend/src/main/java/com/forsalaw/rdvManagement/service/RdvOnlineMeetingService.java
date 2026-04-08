package com.forsalaw.rdvManagement.service;

import com.forsalaw.rdvManagement.entity.RendezVous;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RdvOnlineMeetingService {

    public String generateRoomCode(RendezVous rdv) {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        return "fl-" + rdv.getIdRendezVous().toLowerCase() + "-" + suffix;
    }
}
