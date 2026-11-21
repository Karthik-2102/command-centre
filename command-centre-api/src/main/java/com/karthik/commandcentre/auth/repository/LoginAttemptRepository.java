package com.karthik.commandcentre.auth.repository;

import com.karthik.commandcentre.auth.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    long countByIpAddressAndAttemptedAtAfter(String ipAddress, LocalDateTime since);
    long countByEmailAndSuccessfulFalseAndAttemptedAtAfter(String email, LocalDateTime since);
}
