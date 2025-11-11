import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { skillsAPI } from '../services/skillsAPI';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';

const SearchResults: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [query, setQuery] = useState(q);
  const [jobs, setJobs] = useState<Array<{ uuid: string; title: string }>>([]);
  const [skills, setSkills] = useState<Array<{ uuid: string; name?: string; title?: string }>>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async (value: string) => {
    if (!value.trim()) {
      setJobs([]);
      setSkills([]);
      return;
    }
    setLoading(true);
    try {
      const [jobsRes, skillsRes] = await Promise.all([
        skillsAPI.jobsAutocomplete(value),
        skillsAPI.skillsAutocomplete(value)
      ]);
      setJobs(jobsRes || []);
      setSkills(skillsRes || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ q: query });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={onSubmit} className="mb-6">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs or skills..." />
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <p>Loading...</p>}
              {!loading && jobs.length === 0 && <p className="text-gray-500">No jobs found.</p>}
              <ul className="space-y-2">
                {jobs.map(j => (
                  <li key={j.uuid} className="p-3 border rounded-lg bg-white">{j.title}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <p>Loading...</p>}
              {!loading && skills.length === 0 && <p className="text-gray-500">No skills found.</p>}
              <ul className="space-y-2">
                {skills.map(s => (
                  <li key={s.uuid} className="p-3 border rounded-lg bg-white">{s.name || s.title}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;


