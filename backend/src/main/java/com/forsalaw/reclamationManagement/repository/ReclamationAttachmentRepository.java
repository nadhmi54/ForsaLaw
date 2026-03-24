package com.forsalaw.reclamationManagement.repository;

import com.forsalaw.reclamationManagement.entity.ReclamationAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReclamationAttachmentRepository extends JpaRepository<ReclamationAttachment, Long> {
    List<ReclamationAttachment> findByReclamation_Id(String reclamationId);
}
