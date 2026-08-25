package com.ai.accessibility.repository.jpa;

import com.ai.accessibility.entity.ApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationJpaRepository extends JpaRepository<ApplicationEntity, String> {
    List<ApplicationEntity> findByUserIdAndIsActiveTrue(String userId);
    List<ApplicationEntity> findByJobIdAndIsActiveTrue(String jobId);
    List<ApplicationEntity> findByJobIdInAndIsActiveTrue(List<String> jobIds);
    long countByJobIdInAndIsActiveTrue(List<String> jobIds);
    long countByJobIdInAndStatusAndIsActiveTrue(List<String> jobIds, String status);
    long countByUserIdAndIsActiveTrue(String userId);
    long countByUserIdAndStatusAndIsActiveTrue(String userId, String status);
    Optional<ApplicationEntity> findByJobIdAndUserIdAndIsActiveTrue(String jobId, String userId);
}
