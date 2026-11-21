package com.karthik.commandcentre.project.repository;

import com.karthik.commandcentre.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    long countByOwnerIdAndStatus(Long ownerId, String status);
}
