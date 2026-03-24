package com.forsalaw.rdvManagement.repository;

import com.forsalaw.rdvManagement.entity.RendezVous;
import com.forsalaw.rdvManagement.entity.StatutRendezVous;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, String> {

    Page<RendezVous> findByClient_IdOrderByDateMiseAJourDesc(String clientId, Pageable pageable);

    Page<RendezVous> findByAvocat_IdOrderByDateMiseAJourDesc(String avocatId, Pageable pageable);

    @Query("""
        SELECT r FROM RendezVous r
        WHERE (:clientUserId IS NULL OR r.client.id = :clientUserId)
          AND (:avocatId IS NULL OR r.avocat.id = :avocatId)
          AND (:statut IS NULL OR r.statutRendezVous = :statut)
          AND r.dateCreation >= :du
          AND r.dateCreation <= :au
        ORDER BY r.dateMiseAJour DESC
    """)
    Page<RendezVous> findForAdmin(
            @Param("clientUserId") String clientUserId,
            @Param("avocatId") String avocatId,
            @Param("statut") StatutRendezVous statut,
            @Param("du") LocalDateTime du,
            @Param("au") LocalDateTime au,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(r) > 0 FROM RendezVous r
        WHERE r.avocat.id = :avocatId
          AND r.statutRendezVous IN :statutsOccupes
          AND (:excludeId IS NULL OR r.idRendezVous <> :excludeId)
          AND r.dateHeureDebut < :fin
          AND r.dateHeureFin > :debut
    """)
    boolean hasConflitCreneauAvocat(
            @Param("avocatId") String avocatId,
            @Param("statutsOccupes") Collection<StatutRendezVous> statutsOccupes,
            @Param("excludeId") String excludeId,
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin
    );
}