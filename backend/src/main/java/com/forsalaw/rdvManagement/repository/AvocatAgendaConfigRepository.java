package com.forsalaw.rdvManagement.repository;

import com.forsalaw.rdvManagement.entity.AvocatAgendaConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvocatAgendaConfigRepository extends JpaRepository<AvocatAgendaConfig, String> {
}
