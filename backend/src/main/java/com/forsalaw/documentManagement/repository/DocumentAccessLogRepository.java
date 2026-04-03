package com.forsalaw.documentManagement.repository;

import com.forsalaw.documentManagement.entity.DocumentAccessLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentAccessLogRepository extends JpaRepository<DocumentAccessLog, String> {

    Page<DocumentAccessLog> findByDocument_IdOrderByDateActionDesc(String documentId, Pageable pageable);

    Page<DocumentAccessLog> findByActeur_IdOrderByDateActionDesc(String acteurId, Pageable pageable);
}
