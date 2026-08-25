package com.ai.accessibility.repository.jpa;

import com.ai.accessibility.entity.NormalizedJobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for normalized (external API) jobs.
 */
@Repository
public interface NormalizedJobJpaRepository extends JpaRepository<NormalizedJobEntity, String> {

    /** Used for deduplication: exact provider ID match */
    boolean existsBySourceJobIdAndSource(String sourceJobId, String source);

    /** Used for deduplication: exact apply-URL match */
    boolean existsByApplyUrl(String applyUrl);

    /** Fetch by provider */
    List<NormalizedJobEntity> findBySource(String source);

    /** Full-text search across title, company, location */
    @Query("SELECT j FROM NormalizedJobEntity j WHERE " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<NormalizedJobEntity> searchJobs(@Param("q") String query);

    /** Fuzzy dedup helper: jobs with same company + title + location */
    @Query("SELECT j FROM NormalizedJobEntity j WHERE " +
           "LOWER(j.company) = LOWER(:company) AND " +
           "LOWER(j.title)   = LOWER(:title)   AND " +
           "LOWER(j.location) = LOWER(:location)")
    Optional<NormalizedJobEntity> findByCompanyAndTitleAndLocation(
            @Param("company") String company,
            @Param("title") String title,
            @Param("location") String location);

    /** All jobs ordered by newest first, limited to avoid huge payloads */
    @Query("SELECT j FROM NormalizedJobEntity j ORDER BY j.createdAt DESC")
    List<NormalizedJobEntity> findAllOrderByCreatedAtDesc();
}
