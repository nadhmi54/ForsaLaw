package com.forsalaw.reclamationManagement.repository;

import com.forsalaw.reclamationManagement.entity.Reclamation;
import com.forsalaw.reclamationManagement.entity.StatutReclamation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, String> {

    @Query("SELECT r FROM Reclamation r WHERE r.createur.id = :createurId " +
            "AND (:statut IS NULL OR r.statut = :statut)")
    Page<Reclamation> findByCreateurWithFilters(@Param("createurId") String createurId, 
                                               @Param("statut") StatutReclamation statut, 
                                               Pageable pageable);

    @Query("SELECT r FROM Reclamation r WHERE " +
            "(:createurId IS NULL OR r.createur.id = :createurId) AND " +
            "(:statut IS NULL OR r.statut = :statut)")
    Page<Reclamation> findForAdmin(@Param("createurId") String createurId,
                                   @Param("statut") StatutReclamation statut,
                                   Pageable pageable);
}
