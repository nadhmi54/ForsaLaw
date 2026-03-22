package com.forsalaw.reclamationManagement.repository;

import com.forsalaw.reclamationManagement.entity.ReclamationMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReclamationMessageRepository extends JpaRepository<ReclamationMessage, Long> {
    List<ReclamationMessage> findByReclamation_IdOrderByDateEnvoiAsc(String reclamationId);
}
