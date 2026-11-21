package com.karthik.commandcentre.auth.repository;

import com.karthik.commandcentre.auth.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthSessionRepository extends JpaRepository<AuthSession, UUID> {
    @Query("SELECT s FROM AuthSession s JOIN FETCH s.owner WHERE s.sessionToken = :sessionToken AND s.isActive = true")
    Optional<AuthSession> findBySessionTokenAndIsActiveTrue(String sessionToken);

    @Modifying
    @Query("UPDATE AuthSession s SET s.isActive = false WHERE s.owner.id = :ownerId")
    void deactivateAllByOwnerId(Long ownerId);

    @Modifying
    @Query("UPDATE AuthSession s SET s.isActive = false WHERE s.expiresAt < :now")
    void deactivateExpiredSessions(LocalDateTime now);
}
