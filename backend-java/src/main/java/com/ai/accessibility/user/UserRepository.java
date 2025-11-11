package com.ai.accessibility.user;

import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

@Profile("mongo")
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}


