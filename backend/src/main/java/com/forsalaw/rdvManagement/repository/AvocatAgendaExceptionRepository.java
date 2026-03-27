package com.forsalaw.rdvManagement.repository;

import com.forsalaw.rdvManagement.entity.AvocatAgendaException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvocatAgendaExceptionRepository extends JpaRepository<AvocatAgendaException, String> {

    List<AvocatAgendaException> findByAvocat_IdOrderByDateDebutAsc(String avocatId);

    void deleteByAvocat_IdAndId(String avocatId, String id);
}
