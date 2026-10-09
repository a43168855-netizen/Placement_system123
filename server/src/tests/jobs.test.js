const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const generateToken = require('../utils/generateToken');
const { setupTestDB } = require('./setup');

setupTestDB();

describe('Job CRUD & Ownership API Tests', () => {
  let recruiter1, recruiter1Token;
  let recruiter2, recruiter2Token;
  let company1;
  let job1;

  beforeEach(async () => {
    await Job.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({});

    // Recruiter 1
    recruiter1 = await User.create({
      name: 'Recruiter Alpha',
      email: 'recruiter1@test.com',
      password: 'Password123',
      role: 'recruiter',
    });
    recruiter1Token = generateToken(recruiter1);

    // Recruiter 2
    recruiter2 = await User.create({
      name: 'Recruiter Beta',
      email: 'recruiter2@test.com',
      password: 'Password123',
      role: 'recruiter',
    });
    recruiter2Token = generateToken(recruiter2);

    // Company 1
    company1 = await Company.create({
      name: 'Alpha Corp',
      location: 'Bangalore',
      recruiter: recruiter1._id,
    });

    // Job 1
    job1 = await Job.create({
      title: 'Full Stack Engineer',
      company: company1._id,
      recruiter: recruiter1._id,
      description: 'Exciting full stack role',
      minCgpa: 7.5,
      salary: 15,
      location: 'Bangalore',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'active',
    });
  });

  it('should allow recruiter to create a new job listing', async () => {
    const newJob = {
      title: 'Frontend Developer',
      companyId: company1._id,
      description: 'Build modern user interfaces with React',
      minCgpa: 7.0,
      salary: 12,
      location: 'Remote',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiter1Token}`)
      .send(newJob);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Frontend Developer');
  });

  it('should allow recruiter to update their own job listing', async () => {
    const res = await request(app)
      .put(`/api/jobs/${job1._id}`)
      .set('Authorization', `Bearer ${recruiter1Token}`)
      .send({
        title: 'Senior Full Stack Engineer',
        salary: 18,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Senior Full Stack Engineer');
    expect(res.body.data.salary).toBe(18);
  });

  it('should strictly prevent recruiter from modifying another recruiter job', async () => {
    const res = await request(app)
      .put(`/api/jobs/${job1._id}`)
      .set('Authorization', `Bearer ${recruiter2Token}`)
      .send({
        title: 'Unauthorized Modification Attempt',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/only manage your own job/i);
  });

  it('should allow recruiter to delete their own job', async () => {
    const res = await request(app)
      .delete(`/api/jobs/${job1._id}`)
      .set('Authorization', `Bearer ${recruiter1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const found = await Job.findById(job1._id);
    expect(found).toBeNull();
  });
});
