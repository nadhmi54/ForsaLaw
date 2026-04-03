package com.forsalaw.documentManagement.repository;

import com.forsalaw.documentManagement.entity.ContexteDocument;
import com.forsalaw.documentManagement.entity.DocumentMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentMetadataRepository extends JpaRepository<DocumentMetadata, String> {

    Page<DocumentMetadata> findByDeposeur_IdAndSupprime(
            String deposeurId, boolean supprime, Pageable pageable);

    List<DocumentMetadata> findByContexteTypeAndContexteIdAndSupprime(
            ContexteDocument contexteType, String contexteId, boolean supprime);

    Page<DocumentMetadata> findBySupprime(boolean supprime, Pageable pageable);
}
