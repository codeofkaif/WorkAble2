package com.ai.accessibility.service;

import com.ai.accessibility.entity.ApplicationEntity;
import com.ai.accessibility.entity.JobEntity;
import com.ai.accessibility.entity.UserEntity;
import com.ai.accessibility.model.Resume;
import com.ai.accessibility.repository.jpa.ApplicationJpaRepository;
import com.ai.accessibility.repository.jpa.JobJpaRepository;
import com.ai.accessibility.repository.jpa.UserJpaRepository;
import com.ai.accessibility.repository.mongo.ResumeMongoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private JobJpaRepository jobJpaRepository;

    @Autowired
    private ApplicationJpaRepository applicationJpaRepository;

    @Autowired
    private ResumeMongoRepository resumeMongoRepository;

    public Map<String, Object> getDashboardData(String userId) {
        Optional<UserEntity> userOpt = userJpaRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        UserEntity user = userOpt.get();
        String role = user.getRole() != null ? user.getRole() : "job_seeker";

        Map<String, Object> data = new HashMap<>();
        data.put("role", role);

        Map<String, Object> userData = new HashMap<>();
        userData.put("name", user.getName() != null ? user.getName() : "User");
        userData.put("email", user.getEmail() != null ? user.getEmail() : "");
        userData.put("avatar", user.getAvatar());
        userData.put("location", user.getLocation() != null ? user.getLocation() : "");
        data.put("user", userData);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

        if ("employer".equalsIgnoreCase(role)) {
            // Employer Dashboard Data
            long jobsPosted = jobJpaRepository.countByPostedByAndIsActiveTrue(userId);
            long activeJobs = jobJpaRepository.countByPostedByAndIsActiveTrueAndStatus(userId, "active");

            List<JobEntity> myJobs = jobJpaRepository.findByPostedByAndIsActiveTrue(userId);
            List<String> jobIds = myJobs.stream().map(JobEntity::getId).toList();

            long totalApps = jobIds.isEmpty() ? 0 : applicationJpaRepository.countByJobIdInAndIsActiveTrue(jobIds);
            long shortlisted = jobIds.isEmpty() ? 0 : applicationJpaRepository.countByJobIdInAndStatusAndIsActiveTrue(jobIds, "shortlisted");

            Map<String, Object> stats = new HashMap<>();
            stats.put("jobsPosted", jobsPosted);
            stats.put("activeJobs", activeJobs);
            stats.put("applicationsReceived", totalApps);
            stats.put("shortlistedCandidates", shortlisted);

            data.put("stats", stats);

            List<ApplicationEntity> recentApps = jobIds.isEmpty() ? Collections.emptyList() :
                    applicationJpaRepository.findByJobIdInAndIsActiveTrue(jobIds);

            List<Map<String, Object>> formattedRecentApps = new ArrayList<>();
            for (ApplicationEntity app : recentApps.stream().limit(10).toList()) {
                Map<String, Object> appMap = new HashMap<>();
                appMap.put("id", app.getId());
                appMap.put("status", app.getStatus());
                appMap.put("appliedDate", app.getAppliedDate() != null ? sdf.format(app.getAppliedDate()) : "");

                Optional<JobEntity> job = jobJpaRepository.findById(app.getJobId());
                appMap.put("jobTitle", job.map(JobEntity::getTitle).orElse("Job"));

                Optional<UserEntity> applicant = userJpaRepository.findById(app.getUserId());
                appMap.put("candidateName", applicant.map(UserEntity::getName).orElse("Applicant"));

                formattedRecentApps.add(appMap);
            }

            data.put("recentApplications", formattedRecentApps);
        } else {
            // Job Seeker Dashboard Data
            long appliedCount = applicationJpaRepository.countByUserIdAndIsActiveTrue(userId);
            long shortlistedCount = applicationJpaRepository.countByUserIdAndStatusAndIsActiveTrue(userId, "shortlisted");
            long interviewCount = applicationJpaRepository.countByUserIdAndStatusAndIsActiveTrue(userId, "interview");

            List<Resume> resumes = resumeMongoRepository.findByUserIdAndIsActiveOrderByUpdatedAtDesc(userId, true);
            boolean hasResume = !resumes.isEmpty();

            int completion = 20;
            if (user.getHeadline() != null && !user.getHeadline().isEmpty()) completion += 20;
            if (user.getSummary() != null && !user.getSummary().isEmpty()) completion += 20;
            if (user.getSkills() != null && !user.getSkills().isEmpty()) completion += 20;
            if (hasResume) completion += 20;

            data.put("profileCompletion", completion);

            Map<String, Object> stats = new HashMap<>();
            stats.put("jobsApplied", appliedCount);
            stats.put("shortlisted", shortlistedCount);
            stats.put("interviews", interviewCount);
            stats.put("rejected", 0);

            data.put("stats", stats);

            List<JobEntity> activeJobs = jobJpaRepository.findByIsActiveTrue();
            List<Map<String, Object>> recommendedJobs = new ArrayList<>();
            for (JobEntity j : activeJobs.stream().limit(6).toList()) {
                Map<String, Object> jobMap = new HashMap<>();
                jobMap.put("id", j.getId());
                jobMap.put("title", j.getTitle());
                jobMap.put("company", j.getCompany());
                jobMap.put("location", j.getLocation());
                jobMap.put("type", j.getType());
                jobMap.put("salary", j.getSalary() != null ? j.getSalary() : "Competitive");
                jobMap.put("matchScore", 85);
                jobMap.put("postedDate", j.getCreatedAt() != null ? sdf.format(j.getCreatedAt()) : "");
                recommendedJobs.add(jobMap);
            }

            data.put("recommendedJobs", recommendedJobs);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", data);
        return response;
    }
}
