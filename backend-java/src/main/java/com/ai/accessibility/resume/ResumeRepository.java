package com.ai.accessibility.resume;

import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

@Profile("mongo")
public interface ResumeRepository extends MongoRepository<Resume, String> {
    List<Resume> findByUserIdAndIsActiveOrderByUpdatedAtDesc(String userId, boolean isActive);
}


