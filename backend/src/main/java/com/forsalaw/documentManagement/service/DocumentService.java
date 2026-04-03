package com.forsalaw.documentManagement.service;

import com.forsalaw.documentManagement.entity.*;
import com.forsalaw.documentManagement.model.*;
import com.forsalaw.documentManagement.repository.DocumentAccessLogRepository;
import com.forsalaw.documentManagement.repository.DocumentMetadataRepository;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.repository.UserRepository;
import com.forsalaw.userManagement.service.UserService;
import com.forsalaw.util.HashingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    @Value("${forsalaw.documents.dir:uploads/documents}")
    private String dossierDocuments;

    private final DocumentMetadataRepository documentRepository;
    private final DocumentAccessLogRepository accessLogRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final HashingService hashingService;

    // ─── Upload ──────────────────────────────────────────────────────────────

    @Transactional
    public DocumentMetadataDTO uploadDocument(
            String emailDeposeur,
            MultipartFile fichier,
            ContexteDocument contexteType,
            String contexteId,
            HttpServletRequest servletRequest
    ) throws IOException {
        User deposeur = requireUser(emailDeposeur);

        // 1. Préparer le dossier de stockage
        Path emplacement = Paths.get(dossierDocuments).toAbsolutePath().normalize();
        Files.createDirectories(emplacement);

        // 2. Générer un nom de stockage unique pour éviter les conflits
        String nomOriginal = fichier.getOriginalFilename();
        String extension = extraireExtension(nomOriginal);
        String nomStockage = UUID.randomUUID().toString() + extension;
        Path cibleFichier = emplacement.resolve(nomStockage);

        // 3. Calculer le hash SHA-256 AVANT de stocker (pour garantir l'intégrité)
        String hashSha256 = hashingService.calculerHashSha256(fichier.getInputStream());

        // 4. Copier le fichier sur le disque
        Files.copy(fichier.getInputStream(), cibleFichier, StandardCopyOption.REPLACE_EXISTING);

        // 5. Enregistrer les métadonnées en base de données
        DocumentMetadata doc = new DocumentMetadata();
        doc.setId(userService.generateNextId("DOC"));
        doc.setDeposeur(deposeur);
        doc.setNomOriginal(nomOriginal);
        doc.setNomStockage(nomStockage);
        doc.setCheminFichier(cibleFichier.toString());
        doc.setTypeContenu(fichier.getContentType());
        doc.setTailleFichier(fichier.getSize());
        doc.setHashSha256(hashSha256);
        doc.setContexteType(contexteType != null ? contexteType : ContexteDocument.GENERAL);
        doc.setContexteId(contexteId);
        doc.setSupprime(false);
        doc = documentRepository.save(doc);

        // 6. Tracer l'action d'upload dans le journal d'audit
        enregistrerLog(doc, deposeur, ActionDocument.UPLOAD, servletRequest, null, null);

        return toDTO(doc);
    }

    // ─── Téléchargement ──────────────────────────────────────────────────────

    @Transactional
    public Resource telechargerDocument(String emailActeur, String documentId, HttpServletRequest servletRequest) {
        DocumentMetadata doc = requireDocument(documentId);
        User acteur = requireUser(emailActeur);

        // Vérification des droits : seul le déposeur ou un admin peut télécharger
        verifierDroitsAcces(acteur, doc);

        // Tracer le téléchargement
        enregistrerLog(doc, acteur, ActionDocument.TELECHARGEMENT, servletRequest, null, null);

        try {
            Path cheminFichier = Paths.get(doc.getCheminFichier());
            Resource resource = new UrlResource(cheminFichier.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalStateException("Le fichier est introuvable sur le serveur : " + doc.getNomOriginal());
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new IllegalStateException("Chemin de fichier invalide.", e);
        }
    }

    @Transactional(readOnly = true)
    public Resource telechargerDocumentSysteme(String documentId) {
        DocumentMetadata doc = requireDocument(documentId);
        try {
            Path cheminFichier = Paths.get(doc.getCheminFichier());
            Resource resource = new UrlResource(cheminFichier.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalStateException("Le fichier est introuvable sur le serveur : " + doc.getNomOriginal());
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new IllegalStateException("Chemin de fichier invalide.", e);
        }
    }

    // ─── Vérification d'intégrité ────────────────────────────────────────────

    @Transactional
    public VerificationIntegriteDTO verifierIntegrite(String emailActeur, String documentId, HttpServletRequest servletRequest) throws IOException {
        DocumentMetadata doc = requireDocument(documentId);
        User acteur = requireUser(emailActeur);
        verifierDroitsAcces(acteur, doc);

        Path cheminFichier = Paths.get(doc.getCheminFichier());
        String hashActuel = hashingService.calculerHashSha256(Files.newInputStream(cheminFichier));
        boolean integre = hashActuel.equals(doc.getHashSha256());

        String details = integre
                ? "Document intact depuis le dépôt initial."
                : "ALERTE : Le document a été modifié depuis son dépôt !";

        // Tracer la vérification avec son résultat
        enregistrerLog(doc, acteur, ActionDocument.VERIFICATION_INTEGRITE, servletRequest, integre, details);

        return new VerificationIntegriteDTO(hashActuel, doc.getHashSha256(), integre, doc.getId(), doc.getNomOriginal());
    }

    // ─── Consultation ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<DocumentMetadataDTO> mesDocuments(String email, Pageable pageable) {
        User user = requireUser(email);
        return documentRepository
                .findByDeposeur_IdAndSupprime(user.getId(), false, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<DocumentMetadataDTO> documentsParContexte(ContexteDocument contexteType, String contexteId) {
        return documentRepository
                .findByContexteTypeAndContexteIdAndSupprime(contexteType, contexteId, false)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<DocumentAccessLogDTO> historiqueDocument(String emailActeur, String documentId, Pageable pageable) {
        DocumentMetadata doc = requireDocument(documentId);
        User acteur = requireUser(emailActeur);
        verifierDroitsAcces(acteur, doc);
        return accessLogRepository.findByDocument_IdOrderByDateActionDesc(documentId, pageable).map(this::toLogDTO);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<DocumentMetadataDTO> tousLesDocuments(Pageable pageable) {
        return documentRepository.findBySupprime(false, pageable).map(this::toDTO);
    }

    @Transactional
    public void supprimerDocument(String emailAdmin, String documentId, HttpServletRequest servletRequest) {
        DocumentMetadata doc = requireDocument(documentId);
        User admin = requireUser(emailAdmin);
        doc.setSupprime(true);
        documentRepository.save(doc);
        enregistrerLog(doc, admin, ActionDocument.SUPPRESSION, servletRequest, null, "Suppression logique par admin.");
    }

    // ─── Helpers privés ───────────────────────────────────────────────────────

    private void enregistrerLog(DocumentMetadata doc, User acteur, ActionDocument action,
                                HttpServletRequest request, Boolean integriteValide, String details) {
        DocumentAccessLog log = new DocumentAccessLog();
        log.setId(userService.generateNextId("DAL"));
        log.setDocument(doc);
        log.setActeur(acteur);
        log.setAction(action);
        log.setAdresseIp(request != null ? request.getRemoteAddr() : null);
        log.setIntegriteValide(integriteValide);
        log.setDetails(details);
        accessLogRepository.save(log);
    }

    private void verifierDroitsAcces(User acteur, DocumentMetadata doc) {
        boolean estAdmin = acteur.getRoleUser().name().equalsIgnoreCase("admin");
        boolean estDeposeur = doc.getDeposeur().getId().equals(acteur.getId());
        if (!estAdmin && !estDeposeur) {
            throw new AccessDeniedException("Accès refusé : vous n'êtes pas autorisé à accéder à ce document.");
        }
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
    }

    private DocumentMetadata requireDocument(String documentId) {
        return documentRepository.findById(documentId)
                .filter(d -> !d.isSupprime())
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable ou supprimé."));
    }

    private String extraireExtension(String nomFichier) {
        if (nomFichier != null && nomFichier.contains(".")) {
            return nomFichier.substring(nomFichier.lastIndexOf("."));
        }
        return "";
    }

    private DocumentMetadataDTO toDTO(DocumentMetadata doc) {
        User deposeur = doc.getDeposeur();
        return new DocumentMetadataDTO(
                doc.getId(),
                deposeur.getId(),
                deposeur.getNom() + " " + deposeur.getPrenom(),
                doc.getNomOriginal(),
                doc.getTypeContenu(),
                doc.getTailleFichier(),
                doc.getHashSha256(),
                doc.getContexteType(),
                doc.getContexteId(),
                doc.isSupprime(),
                doc.getDateCreation()
        );
    }

    private DocumentAccessLogDTO toLogDTO(DocumentAccessLog log) {
        User acteur = log.getActeur();
        return new DocumentAccessLogDTO(
                log.getId(),
                acteur != null ? acteur.getId() : null,
                acteur != null ? acteur.getNom() + " " + acteur.getPrenom() : "Système",
                log.getAction(),
                log.getAdresseIp(),
                log.getIntegriteValide(),
                log.getDetails(),
                log.getDateAction()
        );
    }
}
