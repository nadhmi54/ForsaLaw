package com.forsalaw.avisAvocatManagement.repository;

import com.forsalaw.avisAvocatManagement.entity.AvisAvocat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AvisAvocatRepository extends JpaRepository<AvisAvocat, String> {

    boolean existsByUserIdAndAvocatId(String userId, String avocatId);

    @EntityGraph(attributePaths = {"user"})
    Page<AvisAvocat> findByAvocatIdOrderByDateCreationDesc(String avocatId, Pageable pageable);

    @Query("SELECT COALESCE(AVG(a.note), 0) FROM AvisAvocat a WHERE a.avocat.id = :avocatId")
    double getNoteMoyenneByAvocatId(@Param("avocatId") String avocatId);
}
