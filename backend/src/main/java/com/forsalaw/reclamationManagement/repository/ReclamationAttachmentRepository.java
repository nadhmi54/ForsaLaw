package com.forsalaw.reclamationManagement.repository;

import com.forsalaw.reclamationManagement.entity.ReclamationAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReclamationAttachmentRepository extends JpaRepository<ReclamationAttachment, Long> {
    List<ReclamationAttachment> findByReclamation_Id(String reclamationId);

    @Query("SELECT a FROM ReclamationAttachment a JOIN FETCH a.reclamation r JOIN FETCH r.createur WHERE a.id = :id")
    Optional<ReclamationAttachment> findByIdWithReclamationAndCreateur(@Param("id") Long id);
}
