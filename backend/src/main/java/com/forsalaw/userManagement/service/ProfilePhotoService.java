package com.forsalaw.userManagement.service;

import com.forsalaw.avocatManagement.entity.Avocat;
import com.forsalaw.avocatManagement.repository.AvocatRepository;
import com.forsalaw.documentManagement.entity.ContexteDocument;
import com.forsalaw.documentManagement.entity.DocumentMetadata;
import com.forsalaw.documentManagement.model.DocumentMetadataDTO;
import com.forsalaw.documentManagement.repository.DocumentMetadataRepository;
import com.forsalaw.documentManagement.service.DocumentService;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProfilePhotoService {

    private static final long MAX_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            MediaType.IMAGE_GIF_VALUE,
            "image/webp"
    );

    private final UserRepository userRepository;
    private final AvocatRepository avocatRepository;
    private final DocumentService documentService;
    private final DocumentMetadataRepository documentMetadataRepository;

    @Value("${forsalaw.server.public-url:http://localhost:8081}")
    private String publicApiBaseUrl;

    public String userProfilePhotoAbsoluteUrl(User user) {
        if (user.getProfilePhotoDocumentId() == null || user.getProfilePhotoDocumentId().isBlank()) {
            return null;
        }
        return publicApiBaseUrl.replaceAll("/$", "") + "/api/users/me/profile-photo";
    }

    public String avocatPublicProfilePhotoAbsoluteUrl(String avocatId, User user) {
        if (user.getProfilePhotoDocumentId() == null || user.getProfilePhotoDocumentId().isBlank()) {
            return null;
        }
        return publicApiBaseUrl.replaceAll("/$", "") + "/api/avocats/" + avocatId + "/profile-photo";
    }

    @Transactional
    public void uploadProfilePhoto(String email, MultipartFile fichier, HttpServletRequest request) throws IOException {
        assertImage(fichier);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        retireAnciennePhotoSiPresente(user);
        DocumentMetadataDTO doc = documentService.uploadDocument(
                email,
                fichier,
                ContexteDocument.PROFIL_UTILISATEUR,
                user.getId(),
                request
        );
        user.setProfilePhotoDocumentId(doc.getId());
        userRepository.save(user);
    }

    @Transactional
    public Resource telechargerMaPhoto(String email, HttpServletRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        if (user.getProfilePhotoDocumentId() == null || user.getProfilePhotoDocumentId().isBlank()) {
            throw new IllegalArgumentException("Aucune photo de profil.");
        }
        return documentService.telechargerDocument(email, user.getProfilePhotoDocumentId(), request);
    }

    @Transactional(readOnly = true)
    public Resource telechargerPhotoPubliqueAvocat(String avocatId) {
        Avocat avocat = avocatRepository.findById(avocatId)
                .orElseThrow(() -> new IllegalArgumentException("Avocat non trouvé."));
        if (!avocat.isActif()) {
            throw new IllegalArgumentException("Avocat non trouvé.");
        }
        User user = avocat.getUser();
        if (user.getProfilePhotoDocumentId() == null || user.getProfilePhotoDocumentId().isBlank()) {
            throw new IllegalArgumentException("Aucune photo de profil.");
        }
        return documentService.telechargerDocumentSysteme(user.getProfilePhotoDocumentId());
    }

    public MediaType resolveContentType(String documentId) {
        DocumentMetadata doc = documentMetadataRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable."));
        return toMediaType(doc.getTypeContenu());
    }

    @Transactional(readOnly = true)
    public MediaType mediaTypeForUserProfilePhoto(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        if (user.getProfilePhotoDocumentId() == null || user.getProfilePhotoDocumentId().isBlank()) {
            throw new IllegalArgumentException("Aucune photo de profil.");
        }
        return resolveContentType(user.getProfilePhotoDocumentId());
    }

    @Transactional(readOnly = true)
    public MediaType mediaTypeForPublicAvocatProfilePhoto(String avocatId) {
        Avocat avocat = avocatRepository.findById(avocatId)
                .orElseThrow(() -> new IllegalArgumentException("Avocat non trouvé."));
        if (!avocat.isActif()) {
            throw new IllegalArgumentException("Avocat non trouvé.");
        }
        User user = avocat.getUser();
        if (user.getProfilePhotoDocumentId() == null || user.getProfilePhotoDocumentId().isBlank()) {
            throw new IllegalArgumentException("Aucune photo de profil.");
        }
        return resolveContentType(user.getProfilePhotoDocumentId());
    }

    @Transactional(readOnly = true)
    public String originalFilenameForUserProfilePhoto(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé."));
        if (user.getProfilePhotoDocumentId() == null) {
            throw new IllegalArgumentException("Aucune photo de profil.");
        }
        return documentMetadataRepository.findById(user.getProfilePhotoDocumentId())
                .map(DocumentMetadata::getNomOriginal)
                .orElse("profile");
    }

    @Transactional(readOnly = true)
    public String originalFilenameForPublicAvocat(String avocatId) {
        Avocat avocat = avocatRepository.findById(avocatId)
                .orElseThrow(() -> new IllegalArgumentException("Avocat non trouvé."));
        if (!avocat.isActif()) {
            throw new IllegalArgumentException("Avocat non trouvé.");
        }
        String docId = avocat.getUser().getProfilePhotoDocumentId();
        if (docId == null) {
            throw new IllegalArgumentException("Aucune photo de profil.");
        }
        return documentMetadataRepository.findById(docId)
                .map(DocumentMetadata::getNomOriginal)
                .orElse("profile");
    }

    private static MediaType toMediaType(String ct) {
        if (ct == null || ct.isBlank()) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        try {
            return MediaType.parseMediaType(ct);
        } catch (Exception e) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    private void retireAnciennePhotoSiPresente(User user) {
        String oldId = user.getProfilePhotoDocumentId();
        if (oldId == null || oldId.isBlank()) {
            return;
        }
        documentMetadataRepository.findById(oldId).ifPresent(doc -> {
            if (doc.getDeposeur().getId().equals(user.getId())) {
                doc.setSupprime(true);
                documentMetadataRepository.save(doc);
            }
        });
        user.setProfilePhotoDocumentId(null);
    }

    private static void assertImage(MultipartFile fichier) {
        if (fichier == null || fichier.isEmpty()) {
            throw new IllegalArgumentException("Une image est requise.");
        }
        if (fichier.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("Image trop volumineuse (maximum 5 Mo).");
        }
        String ct = fichier.getContentType();
        if (ct == null) {
            throw new IllegalArgumentException("Type de fichier non reconnu.");
        }
        String lower = ct.toLowerCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(lower)) {
            throw new IllegalArgumentException("Formats acceptés : JPEG, PNG, GIF, WebP.");
        }
    }
}
