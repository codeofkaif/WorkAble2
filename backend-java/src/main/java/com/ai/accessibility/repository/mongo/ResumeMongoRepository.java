package com.ai.accessibility.repository.mongo;

import com.ai.accessibility.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeMongoRepository extends MongoRepository<Resume, String> {
    List<Resume> findByUserIdAndIsActiveOrderByUpdatedAtDesc(String userId, boolean isActive);
    List<Resume> findByUserId(String userId);
}
