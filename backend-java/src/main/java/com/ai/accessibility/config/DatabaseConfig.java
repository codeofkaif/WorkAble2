package com.ai.accessibility.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.ai.accessibility.repository.jpa")
@EnableMongoRepositories(basePackages = "com.ai.accessibility.repository.mongo")
@EntityScan(basePackages = "com.ai.accessibility.entity")
public class DatabaseConfig {
}
