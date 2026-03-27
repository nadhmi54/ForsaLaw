package com.forsalaw.rdvManagement.repository;

import com.forsalaw.rdvManagement.entity.AvocatPlageRecurrente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvocatPlageRecurrenteRepository extends JpaRepository<AvocatPlageRecurrente, String> {

    List<AvocatPlageRecurrente> findByAvocat_IdOrderByDayOfWeekAscHeureDebutAsc(String avocatId);

    void deleteByAvocat_IdAndId(String avocatId, String id);
}
