package com.forsalaw.notificationManagement.controller;

import com.forsalaw.notificationManagement.service.WhatsAppService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/whatsapp")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class WhatsAppController {

    private final WhatsAppService whatsAppService;

    @Operation(summary = "Obtenir le QR Code de connexion WhatsApp")
    @GetMapping("/qr")
    public ResponseEntity<Map<String, String>> getQrCode() {
        String qr = whatsAppService.getQrCode();
        if (qr == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Le bridge WhatsApp n'est pas accessible. Vérifiez que le script Node.js tourne sur le port 3099."));
        }
        return ResponseEntity.ok(Map.of("qrCode", qr));
    }

    @Operation(summary = "Statut de la session WhatsApp")
    @GetMapping("/status")
    public ResponseEntity<Map<?, ?>> getStatus() {
        return ResponseEntity.ok(whatsAppService.getStatus());
    }

    @Operation(summary = "Envoyer un message WhatsApp de test (admin)")
    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> sendTest(@RequestBody Map<String, String> body) {
        String to = body.get("telephone");
        String message = body.getOrDefault("message", "✅ ForsaLaw — Test de notification WhatsApp.");
        if (to == null || to.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le champ 'telephone' est requis."));
        }
        whatsAppService.envoyer(to, message);
        return ResponseEntity.ok(Map.of("status", "Message envoyé (ou mis en file d'attente)."));
    }
}
