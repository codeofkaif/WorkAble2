const express = require('express');
const axios = require('axios');

const router = express.Router();

const BASE_URL = process.env.SKILLS_API_BASE_URL || 'https://api.dataatwork.org/v1';
const TIMEOUT_MS = Number(process.env.SKILLS_API_TIMEOUT_MS || 10000);

const client = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS
});

// Helper to forward requests with query params
async function forward(res, path, params) {
  try {
    const { data } = await client.get(path, { params });
    res.json({ status: 'success', data });
  } catch (error) {
    // If external API is not available, return empty array instead of error
    // This prevents frontend from breaking when API is down
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || !error.response) {
      console.warn(`External API unavailable for ${path}:`, error.message);
      // Return empty array to prevent frontend errors
      return res.json({ 
        status: 'success', 
        data: [] 
      });
    }
    const status = error.response?.status || 500;
    res.status(status).json({
      status: 'error',
      message: error.response?.data?.message || error.message || 'Upstream request failed'
    });
  }
}

// Skills autocomplete: /api/skills/autocomplete?contains=react
router.get('/skills/autocomplete', async (req, res) => {
  await forward(res, '/skills/autocomplete', req.query);
});

// Jobs autocomplete: /api/jobs/autocomplete?contains=developer
router.get('/jobs/autocomplete', async (req, res) => {
  await forward(res, '/jobs/autocomplete', req.query);
});

// List all skills (caution: large)
router.get('/skills', async (req, res) => {
  await forward(res, '/skills', req.query);
});

// List all jobs
router.get('/jobs', async (req, res) => {
  await forward(res, '/jobs', req.query);
});

// Job by UUID
router.get('/jobs/:uuid', async (req, res) => {
  await forward(res, `/jobs/${req.params.uuid}`, req.query);
});

// Skill by UUID
router.get('/skills/:uuid', async (req, res) => {
  await forward(res, `/skills/${req.params.uuid}`, req.query);
});

module.exports = router;


