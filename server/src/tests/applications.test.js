const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const generateToken = require('../utils/generateToken');
const { setupTestDB } = require('./setup');

setupTestDB();

describe('Job Application Lifecycle API Tests', () => {
  let studentUser, studentToken, studentProfile;
  let recruiterUser, recruiterToken;
  let otherRecruiter, otherRecruiterToken;
  let company, job, expiredJob;

  beforeEach(async () => {
    await JobApplication.deleteMany({});
    await Job.deleteMany({});
    await Company.deleteMany({});
    await StudentProfile.deleteMany({});
    await User.deleteMany({});

    // Recruiter
    recruiterUser = await User.create({
      name: 'Hiring Manager',
      email: 'recruiter@company.com',
      password: 'Password123',
      role: 'recruiter',
    });
    recruiterToken = generateToken(recruiterUser);

    otherRecruiter = await User.create({
      name: 'Other Recruiter',
      email: 'other@company.com',
      password: 'Password123',
      role: 'recruiter',
    });
    otherRecruiterToken = generateToken(otherRecruiter);

    // Student
    studentUser = await User.create({
      name: 'Bob Smith',
      email: 'bob.smith@student.com',
      password: 'Password123',
      role: 'student',
    });
    studentToken = generateToken(studentUser);

    studentProfile = await StudentProfile.create({
      user: studentUser._id,
      rollNo: '23CS099',
      course: 'B.Tech',
      department: 'Computer Science',
      graduationYear: 2026,
      cgpa: 8.2,
      skills: ['React', 'Node.js'],
    });

    // Company
    company = await Company.create({
      name: 'Innovatech',
      location: 'Hyderabad',
      recruiter: recruiterUser._id,
    });

    // Active Job (min CGPA 8.0)
    job = await Job.create({
      title: 'Backend Engineer',
      company: company._id,
      recruiter: recruiterUser._id,
      description: 'Build APIs',
      minCgpa: 8.0,
      salary: 16,
      location: 'Hyderabad',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'active',
    });

    // Expired Job
    expiredJob = await Job.create({
      title: 'Expired Posting',
      company: company._id,
      recruiter: recruiterUser._id,
      description: 'Past deadline',
      minCgpa: 6.0,
      salary: 10,
      location: 'Remote',
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'active',
    });
  });

  it('should successfully submit an application for an eligible job', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        jobId: job._id,
        coverLetter: 'I am very excited about this backend opportunity!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.student.email).toBe('bob.smith@student.com');
  });

  it('should strictly prevent duplicate application to the same job', async () => {
    // Submit first application
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: job._id });

    // Submit duplicate application
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: job._id });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already submitted an application/i);
  });

  it('should reject application if deadline has passed', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: expiredJob._id });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/deadline.*passed/i);
  });

  it('should reject application if student CGPA does not meet requirements', async () => {
    // Update student CGPA below requirement
    studentProfile.cgpa = 7.5;
    await studentProfile.save();

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: job._id });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/does not meet the minimum requirement/i);
  });

  it('should allow the job recruiter to update the application status to shortlisted and selected', async () => {
    // First apply
    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: job._id });

    const appId = appRes.body.data._id;

    // Recruiter shortlists
    const updateRes = await request(app)
      .patch(`/api/applications/${appId}/status`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        status: 'shortlisted',
        remarks: 'Candidate profile meets requirements. Interview scheduled.',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.status).toBe('shortlisted');
    expect(updateRes.body.data.recruiterRemarks).toBe('Candidate profile meets requirements. Interview scheduled.');
  });

  it('should prevent an unauthorized recruiter from updating applications for another recruiter job', async () => {
    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ jobId: job._id });

    const appId = appRes.body.data._id;

    const res = await request(app)
      .patch(`/api/applications/${appId}/status`)
      .set('Authorization', `Bearer ${otherRecruiterToken}`)
      .send({ status: 'rejected' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
