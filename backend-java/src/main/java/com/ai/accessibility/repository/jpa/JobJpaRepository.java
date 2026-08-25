package com.ai.accessibility.repository.jpa;

import com.ai.accessibility.entity.JobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobJpaRepository extends JpaRepository<JobEntity, String> {
    List<JobEntity> findByIsActiveTrue();
    List<JobEntity> findByPostedByAndIsActiveTrue(String postedBy);
    long countByPostedByAndIsActiveTrue(String postedBy);
    long countByPostedByAndIsActiveTrueAndStatus(String postedBy, String status);

    @Query("SELECT j FROM JobEntity j WHERE j.isActive = true AND " +
           "(:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<JobEntity> searchJobs(@Param("search") String search);
}
