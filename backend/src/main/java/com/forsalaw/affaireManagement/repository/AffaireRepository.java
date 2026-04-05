package com.forsalaw.affaireManagement.repository;

import com.forsalaw.affaireManagement.entity.Affaire;
import com.forsalaw.affaireManagement.entity.StatutAffaire;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AffaireRepository extends JpaRepository<Affaire, String> {

    Page<Affaire> findByClient_Id(String clientId, Pageable pageable);

    Page<Affaire> findByAvocat_Id(String avocatId, Pageable pageable);

    Page<Affaire> findByStatut(StatutAffaire statut, Pageable pageable);

    long countByAvocat_Id(String avocatId);

    boolean existsByRendezVous_IdRendezVous(String idRendezVous);
}
