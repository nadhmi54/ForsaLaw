package com.forsalaw.rdvManagement.controller;

import com.forsalaw.rdvManagement.model.*;
import com.forsalaw.rdvManagement.service.AvocatAgendaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rendezvous/avocat/agenda")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AVOCAT')")
@SecurityRequirement(name = "bearerAuth")
public class AvocatAgendaController {

    private final AvocatAgendaService avocatAgendaService;

    @Operation(summary = "Consulter la configuration d'agenda (fuseau, durees, plages, exceptions)")
    @GetMapping
    public ResponseEntity<AgendaCompletDTO> getAgenda(Authentication authentication) {
        return ResponseEntity.ok(avocatAgendaService.getAgendaComplet(authentication.getName()));
    }

    @Operation(summary = "Mettre a jour la configuration d'agenda (fuseau, duree creneau, marge, actif)")
    @PutMapping("/config")
    public ResponseEntity<AgendaCompletDTO> updateConfig(
            Authentication authentication,
            @RequestBody UpdateAgendaConfigRequest request
    ) {
        return ResponseEntity.ok(avocatAgendaService.updateAgendaConfig(authentication.getName(), request));
    }

    @Operation(summary = "Ajouter une plage horaire recurrente (jour de la semaine + heures)")
    @PostMapping("/plages")
    public ResponseEntity<PlageRecurrenteDTO> ajouterPlage(
            Authentication authentication,
            @RequestBody CreatePlageRecurrenteRequest request
    ) {
        return ResponseEntity.ok(avocatAgendaService.ajouterPlage(authentication.getName(), request));
    }

    @Operation(summary = "Supprimer une plage horaire")
    @DeleteMapping("/plages/{idPlage}")
    public ResponseEntity<Void> supprimerPlage(
            Authentication authentication,
            @PathVariable String idPlage
    ) {
        avocatAgendaService.supprimerPlage(authentication.getName(), idPlage);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Ajouter une periode d'indisponibilite (conges, fermeture)")
    @PostMapping("/exceptions")
    public ResponseEntity<AgendaExceptionDTO> ajouterException(
            Authentication authentication,
            @RequestBody CreateAgendaExceptionRequest request
    ) {
        return ResponseEntity.ok(avocatAgendaService.ajouterException(authentication.getName(), request));
    }

    @Operation(summary = "Supprimer une exception d'agenda")
    @DeleteMapping("/exceptions/{idException}")
    public ResponseEntity<Void> supprimerException(
            Authentication authentication,
            @PathVariable String idException
    ) {
        avocatAgendaService.supprimerException(authentication.getName(), idException);
        return ResponseEntity.noContent().build();
    }
}
