package com.ai.accessibility.service;

import com.ai.accessibility.entity.ApplicationEntity;
import com.ai.accessibility.entity.JobEntity;
import com.ai.accessibility.entity.UserEntity;
import com.ai.accessibility.repository.jpa.ApplicationJpaRepository;
import com.ai.accessibility.repository.jpa.JobJpaRepository;
import com.ai.accessibility.repository.jpa.UserJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationJpaRepository applicationJpaRepository;

    @Autowired
    private JobJpaRepository jobJpaRepository;

    @Autowired
    private UserJpaRepository userJpaRepository;

    public ApplicationEntity applyToJob(String userId, String jobId, String resumeId, String coverLetter) {
        Optional<JobEntity> jobOpt = jobJpaRepository.findById(jobId);
        if (jobOpt.isEmpty() || !jobOpt.get().isActive() || !"active".equalsIgnoreCase(jobOpt.get().getStatus())) {
            throw new IllegalArgumentException("Job not found or not accepting applications");
        }

        Optional<ApplicationEntity> existing = applicationJpaRepository.findByJobIdAndUserIdAndIsActiveTrue(jobId, userId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("You have already applied to this job");
        }

        ApplicationEntity app = new ApplicationEntity();
        app.setUserId(userId);
        app.setJobId(jobId);
        app.setResumeId(resumeId);
        app.setCoverLetter(coverLetter);
        app.setStatus("pending");

        ApplicationEntity saved = applicationJpaRepository.save(app);

        // Increment application count on job
        JobEntity job = jobOpt.get();
        job.setApplicationCount((job.getApplicationCount() == null ? 0 : job.getApplicationCount()) + 1);
        jobJpaRepository.save(job);

        return saved;
    }

    public List<Map<String, Object>> getUserApplications(String userId) {
        List<ApplicationEntity> apps = applicationJpaRepository.findByUserIdAndIsActiveTrue(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (ApplicationEntity app : apps) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", app.getId());
            map.put("_id", app.getId());
            map.put("jobId", app.getJobId());
            map.put("status", app.getStatus());
            map.put("appliedDate", app.getAppliedDate());
            map.put("coverLetter", app.getCoverLetter());

            Optional<JobEntity> jobOpt = jobJpaRepository.findById(app.getJobId());
            jobOpt.ifPresent(job -> {
                Map<String, Object> jobMap = new HashMap<>();
                jobMap.put("title", job.getTitle());
                jobMap.put("company", job.getCompany());
                jobMap.put("location", job.getLocation());
                jobMap.put("workMode", job.getWorkMode());
                map.put("job", jobMap);
            });

            result.add(map);
        }

        return result;
    }

    public List<Map<String, Object>> getJobApplicants(String employerId, String jobId) {
        Optional<JobEntity> jobOpt = jobJpaRepository.findById(jobId);
        if (jobOpt.isEmpty() || !jobOpt.get().getPostedBy().equals(employerId)) {
            throw new IllegalArgumentException("Unauthorized to view applicants for this job");
        }

        List<ApplicationEntity> apps = applicationJpaRepository.findByJobIdAndIsActiveTrue(jobId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (ApplicationEntity app : apps) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", app.getId());
            map.put("_id", app.getId());
            map.put("status", app.getStatus());
            map.put("appliedDate", app.getAppliedDate());
            map.put("resumeId", app.getResumeId());
            map.put("coverLetter", app.getCoverLetter());

            Optional<UserEntity> userOpt = userJpaRepository.findById(app.getUserId());
            userOpt.ifPresent(u -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", u.getId());
                userMap.put("name", u.getName());
                userMap.put("email", u.getEmail());
                userMap.put("headline", u.getHeadline());
                userMap.put("skills", u.getSkills());
                map.put("user", userMap);
            });

            result.add(map);
        }

        return result;
    }

    public ApplicationEntity updateApplicationStatus(String employerId, String applicationId, String newStatus) {
        Optional<ApplicationEntity> appOpt = applicationJpaRepository.findById(applicationId);
        if (appOpt.isEmpty()) {
            throw new IllegalArgumentException("Application not found");
        }

        ApplicationEntity app = appOpt.get();
        Optional<JobEntity> jobOpt = jobJpaRepository.findById(app.getJobId());
        if (jobOpt.isEmpty() || !jobOpt.get().getPostedBy().equals(employerId)) {
            throw new IllegalArgumentException("Unauthorized to update this application");
        }

        app.setStatus(newStatus);
        return applicationJpaRepository.save(app);
    }
}
