package com.forsalaw.reclamationManagement.service;

import com.forsalaw.reclamationManagement.entity.Reclamation;
import com.forsalaw.reclamationManagement.entity.ReclamationAttachment;
import com.forsalaw.reclamationManagement.repository.ReclamationAttachmentRepository;
import com.forsalaw.reclamationManagement.repository.ReclamationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    @Value("${forsalaw.upload.dir:uploads/reclamations}")
    private String dossiersUpload;

    private final ReclamationAttachmentRepository attachmentRepository;
    private final ReclamationRepository reclamationRepository;

    @Transactional
    public ReclamationAttachment stockerFichier(MultipartFile fichier, String reclamationId) throws IOException {
        Reclamation r = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new IllegalArgumentException("Réclamation non trouvée"));

        Path emplacement = Paths.get(dossiersUpload).toAbsolutePath().normalize();
        if (!Files.exists(emplacement)) {
            Files.createDirectories(emplacement);
        }

        String nomOriginal = fichier.getOriginalFilename();
        String extension = "";
        if (nomOriginal != null && nomOriginal.contains(".")) {
            extension = nomOriginal.substring(nomOriginal.lastIndexOf("."));
        }
        
        String nomStockage = UUID.randomUUID().toString() + extension;
        Path cible = emplacement.resolve(nomStockage);
        Files.copy(fichier.getInputStream(), cible, StandardCopyOption.REPLACE_EXISTING);

        ReclamationAttachment pieces = new ReclamationAttachment();
        pieces.setReclamation(r);
        pieces.setNomFichier(nomOriginal);
        pieces.setCheminFichier(cible.toString());
        pieces.setTypeContenu(fichier.getContentType());
        pieces.setTailleFichier(fichier.getSize());
        
        return attachmentRepository.save(pieces);
    }
    
    public Path getFichier(String chemin) {
        return Paths.get(chemin);
    }
}
