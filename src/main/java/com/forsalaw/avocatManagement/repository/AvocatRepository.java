package com.forsalaw.avocatManagement.repository;

import com.forsalaw.avocatManagement.entity.Avocat;
import com.forsalaw.avocatManagement.entity.SpecialiteJuridique;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AvocatRepository extends JpaRepository<Avocat, Long> {

    Optional<Avocat> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @Query(value = "SELECT a FROM Avocat a JOIN FETCH a.user WHERE a.actif = true " +
           "AND (:specialite IS NULL OR a.specialite = :specialite) " +
           "AND (:ville IS NULL OR :ville = '' OR LOWER(a.ville) LIKE LOWER(CONCAT('%', :ville, '%'))) " +
           "AND (:verifie IS NULL OR a.verifie = :verifie)",
           countQuery = "SELECT COUNT(a) FROM Avocat a WHERE a.actif = true " +
           "AND (:specialite IS NULL OR a.specialite = :specialite) " +
           "AND (:ville IS NULL OR :ville = '' OR LOWER(a.ville) LIKE LOWER(CONCAT('%', :ville, '%'))) " +
           "AND (:verifie IS NULL OR a.verifie = :verifie)")
    Page<Avocat> findAllActifsFiltered(
            @Param("specialite") SpecialiteJuridique specialite,
            @Param("ville") String ville,
            @Param("verifie") Boolean verifie,
            Pageable pageable
    );

    @Query(value = "SELECT a FROM Avocat a JOIN FETCH a.user WHERE " +
           "(:specialite IS NULL OR a.specialite = :specialite) " +
           "AND (:ville IS NULL OR :ville = '' OR LOWER(a.ville) LIKE LOWER(CONCAT('%', :ville, '%'))) " +
           "AND (:verifie IS NULL OR a.verifie = :verifie) " +
           "AND (:actif IS NULL OR a.actif = :actif)",
           countQuery = "SELECT COUNT(a) FROM Avocat a WHERE " +
           "(:specialite IS NULL OR a.specialite = :specialite) " +
           "AND (:ville IS NULL OR :ville = '' OR LOWER(a.ville) LIKE LOWER(CONCAT('%', :ville, '%'))) " +
           "AND (:verifie IS NULL OR a.verifie = :verifie) " +
           "AND (:actif IS NULL OR a.actif = :actif)")
    Page<Avocat> findAllFiltered(
            @Param("specialite") SpecialiteJuridique specialite,
            @Param("ville") String ville,
            @Param("verifie") Boolean verifie,
            @Param("actif") Boolean actif,
            Pageable pageable
    );
}
