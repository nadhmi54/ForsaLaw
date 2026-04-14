package com.forsalaw.auditManagement.repository;

import com.forsalaw.auditManagement.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    Page<AuditLog> findByActor_Id(String actorUserId, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE " +
            "(:actorUserId IS NULL OR a.actor.id = :actorUserId) AND " +
            "(:moduleName IS NULL OR LOWER(a.moduleName) LIKE LOWER(CONCAT('%', :moduleName, '%'))) AND " +
            "(:action IS NULL OR LOWER(a.action) LIKE LOWER(CONCAT('%', :action, '%'))) AND " +
            "(:method IS NULL OR UPPER(a.method) = :method) AND " +
            "(:httpStatus IS NULL OR a.httpStatus = :httpStatus)")
    Page<AuditLog> findForAdmin(
            @Param("actorUserId") String actorUserId,
            @Param("moduleName") String moduleName,
            @Param("action") String action,
            @Param("method") String method,
            @Param("httpStatus") Integer httpStatus,
            Pageable pageable
    );
}
