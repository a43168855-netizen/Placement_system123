const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const generateToken = require('../utils/generateToken');
const { setupTestDB } = require('./setup');

setupTestDB();

describe('Student CRUD API Tests', () => {
  let adminToken;
  let recruiterToken;
  let studentToken;
  let testStudentId;

  beforeEach(async () => {
    await StudentProfile.deleteMany({});
    await User.deleteMany({});

    // Create Admin
    const admin = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'AdminPassword123',
      role: 'admin',
    });
    adminToken = generateToken(admin);

    // Create Recruiter
    const recruiter = await User.create({
      name: 'Recruiter Test',
      email: 'recruiter@test.com',
      password: 'RecruiterPassword123',
      role: 'recruiter',
    });
    recruiterToken = generateToken(recruiter);

    // Create initial Student
    const student = await User.create({
      name: 'John Doe',
      email: 'john.doe@test.com',
      password: 'StudentPassword123',
      role: 'student',
    });
    studentToken = generateToken(student);

    const profile = await StudentProfile.create({
      user: student._id,
      rollNo: '23CS001',
      course: 'B.Tech',
      department: 'Computer Science',
      graduationYear: 2026,
      cgpa: 8.5,
      skills: ['JavaScript', 'React', 'Node.js'],
    });
    testStudentId = profile._id;
  });

  it('should allow admin to retrieve all student records', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].rollNo).toBe('23CS001');
  });

  it('should allow admin to create a new student record', async () => {
    const newStudentData = {
      name: 'Alice Johnson',
      email: 'alice.johnson@test.com',
      password: 'Password123',
      rollNo: '23CS002',
      course: 'B.Tech',
      department: 'Information Technology',
      graduationYear: 2026,
      cgpa: 9.0,
      skills: ['Python', 'Django'],
    };

    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newStudentData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rollNo).toBe('23CS002');
    expect(res.body.data.user.email).toBe('alice.johnson@test.com');
  });

  it('should allow admin to update a student record', async () => {
    const res = await request(app)
      .put(`/api/students/${testStudentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        cgpa: 9.25,
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Docker'],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cgpa).toBe(9.25);
    expect(res.body.data.skills).toContain('Docker');
  });

  it('should allow admin to delete a student record', async () => {
    const res = await request(app)
      .delete(`/api/students/${testStudentId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const found = await StudentProfile.findById(testStudentId);
    expect(found).toBeNull();
  });

  it('should forbid student from deleting other student records', async () => {
    const res = await request(app)
      .delete(`/api/students/${testStudentId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });
});
