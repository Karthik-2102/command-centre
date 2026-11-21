package com.karthik.commandcentre.career.repository;

import com.karthik.commandcentre.career.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByOwnerIdOrderByApplicationDateDesc(Long ownerId);
    long countByOwnerIdAndStatus(Long ownerId, String status);
}
