package com.karthik.commandcentre.review.repository;

import com.karthik.commandcentre.review.entity.WeeklyReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeeklyReviewRepository extends JpaRepository<WeeklyReview, Long> {
    List<WeeklyReview> findByOwnerIdOrderByWeekStartDateDesc(Long ownerId);
}
