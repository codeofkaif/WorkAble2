package com.ai.accessibility.repository.jpa;

import com.ai.accessibility.entity.NormalizedJobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for normalized jobs in PostgreSQL.
 */
@Repository
public interface NormalizedJobJpaRepository extends JpaRepository<NormalizedJobEntity, String> {

    /** Deduplication check by provider unique job ID */
    Optional<NormalizedJobEntity> findBySourceJobIdAndSource(String sourceJobId, String source);

    /** Deduplication check by application URL */
    Optional<NormalizedJobEntity> findByApplyUrl(String applyUrl);

    /** Fuzzy deduplication check by company, title, and location */
    @Query("SELECT j FROM NormalizedJobEntity j WHERE " +
           "LOWER(j.company) = LOWER(:company) AND " +
           "LOWER(j.title)   = LOWER(:title)   AND " +
           "LOWER(j.location) = LOWER(:location)")
    Optional<NormalizedJobEntity> findByCompanyAndTitleAndLocation(
            @Param("company") String company,
            @Param("title") String title,
            @Param("location") String location);

    /** Check count of active jobs fetched after the specified freshness cutoff */
    @Query("SELECT COUNT(j) FROM NormalizedJobEntity j WHERE j.isActive = true AND j.fetchedAt >= :cutoff")
    long countFreshActiveJobs(@Param("cutoff") Date cutoff);

    /** Find all active fresh jobs */
    @Query("SELECT j FROM NormalizedJobEntity j WHERE j.isActive = true AND j.fetchedAt >= :cutoff ORDER BY COALESCE(j.postedAt, j.createdAt) DESC")
    List<NormalizedJobEntity> findFreshActiveJobs(@Param("cutoff") Date cutoff);

    /** Find all active jobs ordered by newest first */
    @Query("SELECT j FROM NormalizedJobEntity j WHERE j.isActive = true ORDER BY COALESCE(j.postedAt, j.createdAt) DESC")
    List<NormalizedJobEntity> findAllActiveJobsOrderByNewest();

    /** Count all currently active jobs */
    long countByIsActiveTrue();

    /** Find jobs that have passed their expiration date and are still marked active */
    @Query("SELECT j FROM NormalizedJobEntity j WHERE j.isActive = true AND j.expiresAt IS NOT NULL AND j.expiresAt < :now")
    List<NormalizedJobEntity> findExpiredActiveJobs(@Param("now") Date now);

    /** Mark expired jobs as inactive in batch */
    @Modifying
    @Transactional
    @Query("UPDATE NormalizedJobEntity j SET j.isActive = false, j.updatedAt = :now WHERE j.isActive = true AND j.expiresAt IS NOT NULL AND j.expiresAt < :now")
    int deactivateExpiredJobs(@Param("now") Date now);

    /** Full-text / substring search across title, company, location, description */
    @Query("SELECT j FROM NormalizedJobEntity j WHERE j.isActive = true AND (" +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<NormalizedJobEntity> searchActiveJobs(@Param("q") String query);
}
