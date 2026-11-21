package com.karthik.commandcentre.auth.repository;

import com.karthik.commandcentre.auth.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByOwnerIdAndPurposeAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            Long ownerId, String purpose, LocalDateTime now);

    Optional<OtpVerification> findTopByTempTokenAndIsUsedFalseOrderByCreatedAtDesc(String tempToken);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.isUsed = true WHERE o.owner.id = :ownerId AND o.isUsed = false")
    void invalidateAllByOwnerId(Long ownerId);

    Optional<OtpVerification> findTopByOwnerIdAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(
            Long ownerId, String purpose);
}
