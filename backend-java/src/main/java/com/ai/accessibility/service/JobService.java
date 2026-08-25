package com.ai.accessibility.service;

import com.ai.accessibility.entity.JobEntity;
import com.ai.accessibility.repository.jpa.JobJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JobService {

    @Autowired
    private JobJpaRepository jobJpaRepository;

    public JobEntity createJob(String employerId, Map<String, Object> jobData) {
        JobEntity job = new JobEntity();
        job.setPostedBy(employerId);
        job.setTitle((String) jobData.get("title"));
        job.setCompany((String) jobData.get("company"));
        job.setLocation((String) jobData.get("location"));
        job.setDescription((String) jobData.get("description"));

        if (jobData.containsKey("requirements")) job.setRequirements((String) jobData.get("requirements"));
        if (jobData.containsKey("salary")) job.setSalary((String) jobData.get("salary"));
        if (jobData.containsKey("workMode")) job.setWorkMode((String) jobData.get("workMode"));
        if (jobData.containsKey("type")) job.setType((String) jobData.get("type"));
        if (jobData.containsKey("experienceLevel")) job.setExperienceLevel((String) jobData.get("experienceLevel"));

        if (jobData.get("skillsRequired") instanceof List) {
            job.setSkillsRequired((List<String>) jobData.get("skillsRequired"));
        }
        if (jobData.get("accessibilitySupport") instanceof List) {
            job.setAccessibilitySupport((List<String>) jobData.get("accessibilitySupport"));
        }

        return jobJpaRepository.save(job);
    }

    public List<JobEntity> getAllJobs(String search, String type, String workMode, String location) {
        List<JobEntity> jobs;
        if (search != null && !search.trim().isEmpty()) {
            jobs = jobJpaRepository.searchJobs(search.trim());
        } else {
            jobs = jobJpaRepository.findByIsActiveTrue();
        }

        // Apply filters in memory
        return jobs.stream().filter(j -> {
            if (type != null && !type.equalsIgnoreCase("all") && !j.getType().equalsIgnoreCase(type)) return false;
            if (workMode != null && !workMode.equalsIgnoreCase("all") && !j.getWorkMode().equalsIgnoreCase(workMode)) return false;
            if (location != null && !location.isEmpty() && !j.getLocation().toLowerCase().contains(location.toLowerCase())) return false;
            return true;
        }).toList();
    }

    public Optional<JobEntity> getJobById(String id) {
        return jobJpaRepository.findById(id).filter(JobEntity::isActive);
    }

    public List<JobEntity> getEmployerJobs(String employerId) {
        return jobJpaRepository.findByPostedByAndIsActiveTrue(employerId);
    }

    public JobEntity updateJob(String jobId, String employerId, Map<String, Object> updates) {
        Optional<JobEntity> jobOpt = jobJpaRepository.findById(jobId);
        if (jobOpt.isEmpty() || !jobOpt.get().getPostedBy().equals(employerId)) {
            throw new IllegalArgumentException("Job not found or unauthorized");
        }

        JobEntity job = jobOpt.get();
        if (updates.containsKey("title")) job.setTitle((String) updates.get("title"));
        if (updates.containsKey("company")) job.setCompany((String) updates.get("company"));
        if (updates.containsKey("location")) job.setLocation((String) updates.get("location"));
        if (updates.containsKey("description")) job.setDescription((String) updates.get("description"));
        if (updates.containsKey("requirements")) job.setRequirements((String) updates.get("requirements"));
        if (updates.containsKey("salary")) job.setSalary((String) updates.get("salary"));
        if (updates.containsKey("workMode")) job.setWorkMode((String) updates.get("workMode"));
        if (updates.containsKey("type")) job.setType((String) updates.get("type"));
        if (updates.containsKey("status")) job.setStatus((String) updates.get("status"));

        return jobJpaRepository.save(job);
    }

    public void deleteJob(String jobId, String employerId) {
        Optional<JobEntity> jobOpt = jobJpaRepository.findById(jobId);
        if (jobOpt.isPresent() && jobOpt.get().getPostedBy().equals(employerId)) {
            JobEntity job = jobOpt.get();
            job.setIsActive(false);
            jobJpaRepository.save(job);
        }
    }
}
