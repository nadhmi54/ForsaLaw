package com.forsalaw.reclamationManagement.controller;

import com.forsalaw.reclamationManagement.entity.StatutReclamation;
import com.forsalaw.reclamationManagement.model.*;
import com.forsalaw.reclamationManagement.service.ReclamationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reclamations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ReclamationController {

    private final ReclamationService reclamationService;

    @Operation(
            summary = "Créer une réclamation",
            description = "Le créateur est **toujours** l'utilisateur du token JWT (email du compte connecté). "
                    + "Vous n'avez **pas** à envoyer votre identifiant : il est déduit automatiquement. "
                    + "Le champ `utilisateurCibleId` est **optionnel** : ne le renseignez que pour désigner un autre utilisateur du système (ex. avocat), pas pour vous identifier.")
    @PostMapping
    public ResponseEntity<ReclamationDTO> creer(
            Authentication authentication,
            @Valid
            @RequestBody
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Corps sans identifiant du créateur (pris sur le JWT après **Authorize**).",
                    content = @Content(
                            mediaType = "application/json",
                            examples = {
                                    @ExampleObject(
                                            name = "Cas courant",
                                            summary = "Sans utilisateur cible",
                                            value = """
                                                    {
                                                      "titre": "Problème de facturation",
                                                      "description": "Je souhaite contester un prélèvement.",
                                                      "categorie": "FACTURATION",
                                                      "gravite": "MOYENNE"
                                                    }
                                                    """),
                                    @ExampleObject(
                                            name = "Avec personne désignée",
                                            summary = "Optionnel : autre utilisateur (ex. avocat)",
                                            value = """
                                                    {
                                                      "titre": "Demande juridique",
                                                      "description": "Besoin d'un suivi par un avocat du cabinet.",
                                                      "categorie": "JURIDIQUE",
                                                      "gravite": "BASSE",
                                                      "utilisateurCibleId": "id-utilisateur-existant-en-base"
                                                    }
                                                    """)
                            }))
            CreateReclamationRequest request) {
        return ResponseEntity.ok(reclamationService.creerReclamation(authentication.getName(), request));
    }

    @Operation(summary = "Liste de mes réclamations")
    @GetMapping
    public ResponseEntity<Page<ReclamationDTO>> listerMes(
            Authentication authentication,
            @RequestParam(required = false) StatutReclamation statut,
            @PageableDefault(size = 20, sort = "dateModification", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(reclamationService.listerMesReclamations(authentication.getName(), statut, pageable));
    }

    @Operation(summary = "Détail d'une réclamation")
    @GetMapping("/{id}")
    public ResponseEntity<ReclamationDTO> getDetail(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(reclamationService.getDetailReclamation(authentication.getName(), id));
    }

    @Operation(summary = "Ajouter un message")
    @PostMapping("/{id}/messages")
    public ResponseEntity<ReclamationMessageDTO> ajouterMessage(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody MessageRequest request
    ) {
        return ResponseEntity.ok(reclamationService.ajouterMessage(authentication.getName(), id, request.getContenu()));
    }

    @Operation(summary = "Timeline des messages")
    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ReclamationMessageDTO>> getMessages(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(reclamationService.getMessages(authentication.getName(), id));
    }
}
