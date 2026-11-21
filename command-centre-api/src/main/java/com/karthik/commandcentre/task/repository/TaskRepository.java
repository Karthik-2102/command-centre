package com.karthik.commandcentre.task.repository;

import com.karthik.commandcentre.task.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByOwnerIdAndDueDate(Long ownerId, LocalDate dueDate);
    List<Task> findByOwnerIdAndStatus(Long ownerId, String status);
    List<Task> findByOwnerIdAndDueDateBetween(Long ownerId, LocalDate start, LocalDate end);
    List<Task> findByOwnerIdAndStatusAndDueDateBetween(Long ownerId, String status, LocalDate start, LocalDate end);
    Page<Task> findByOwnerIdOrderByCreatedAtDesc(Long ownerId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.owner.id = :ownerId AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Task> searchByOwner(Long ownerId, String query, Pageable pageable);

    long countByOwnerIdAndStatus(Long ownerId, String status);
}
