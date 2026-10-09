require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await connectDB();

    console.log('Clearing existing collections...');
    await JobApplication.deleteMany({});
    await Job.deleteMany({});
    await Company.deleteMany({});
    await StudentProfile.deleteMany({});
    await User.deleteMany({});

    console.log('Seeding Users...');

    // 1. Admin Accounts
    const admin = await User.create({
      name: 'Dr. Ramesh Sharma (Placement Director)',
      email: 'admin@placement.edu',
      password: 'AdminPassword@123',
      role: 'admin',
      status: 'active',
    });

    await User.create({
      name: 'Placement Officer',
      email: 'admin@placement.com',
      password: 'Admin@123',
      role: 'admin',
      status: 'active',
    });

    await User.create({
      name: 'System Admin',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
    });

    await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
    });

    // 2. Recruiters
    const recruiterGoogle = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@google.com',
      password: 'RecruiterPassword@123',
      role: 'recruiter',
      status: 'active',
    });

    const recruiterMicrosoft = await User.create({
      name: 'David Miller',
      email: 'recruiter@microsoft.com',
      password: 'RecruiterPassword@123',
      role: 'recruiter',
      status: 'active',
    });

    const recruiterAmazon = await User.create({
      name: 'Priya Nair',
      email: 'recruiter@amazon.com',
      password: 'RecruiterPassword@123',
      role: 'recruiter',
      status: 'active',
    });

    // 3. Students
    const student1 = await User.create({
      name: 'Aarav Mehta',
      email: 'student@placement.edu',
      password: 'StudentPassword@123',
      role: 'student',
      status: 'active',
    });

    const student2 = await User.create({
      name: 'Ananya Patel',
      email: 'ananya.patel@placement.edu',
      password: 'StudentPassword@123',
      role: 'student',
      status: 'active',
    });

    const student3 = await User.create({
      name: 'Rohit Verma',
      email: 'rohit.verma@placement.edu',
      password: 'StudentPassword@123',
      role: 'student',
      status: 'active',
    });

    const student4 = await User.create({
      name: 'Sneha Reddy',
      email: 'sneha.reddy@placement.edu',
      password: 'StudentPassword@123',
      role: 'student',
      status: 'active',
    });

    const student5 = await User.create({
      name: 'Vikram Singh',
      email: 'vikram.singh@placement.edu',
      password: 'StudentPassword@123',
      role: 'student',
      status: 'active',
    });

    console.log('Seeding Student Profiles...');
    const profile1 = await StudentProfile.create({
      user: student1._id,
      rollNo: '22CS045',
      course: 'B.Tech',
      department: 'Computer Science',
      graduationYear: 2026,
      cgpa: 8.85,
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript', 'Docker'],
      resumeUrl: 'https://storage.placement.edu/resumes/aarav_mehta.pdf',
      phone: '+91 98765 43210',
      bio: 'Full-stack developer interested in distributed cloud architectures and scalable web platforms.',
      placementStatus: 'unplaced',
    });

    const profile2 = await StudentProfile.create({
      user: student2._id,
      rollNo: '22IT012',
      course: 'B.Tech',
      department: 'Information Technology',
      graduationYear: 2026,
      cgpa: 9.2,
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'FastAPI', 'SQL'],
      resumeUrl: 'https://storage.placement.edu/resumes/ananya_patel.pdf',
      phone: '+91 98765 43211',
      bio: 'Data science and AI researcher with 2 published conference papers on deep learning.',
      placementStatus: 'placed',
      placedCompany: 'Google Cloud Technologies',
      placedPackage: 24.5,
    });

    const profile3 = await StudentProfile.create({
      user: student3._id,
      rollNo: '22EC088',
      course: 'B.Tech',
      department: 'Electronics & Communication',
      graduationYear: 2026,
      cgpa: 7.4,
      skills: ['C++', 'Embedded Systems', 'IoT', 'Linux', 'Microcontrollers'],
      resumeUrl: 'https://storage.placement.edu/resumes/rohit_verma.pdf',
      phone: '+91 98765 43212',
      bio: 'Passionate about firmware engineering, robotics, and smart edge hardware.',
      placementStatus: 'unplaced',
    });

    const profile4 = await StudentProfile.create({
      user: student4._id,
      rollNo: '22CS104',
      course: 'B.Tech',
      department: 'Computer Science',
      graduationYear: 2026,
      cgpa: 8.5,
      skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'PostgreSQL'],
      resumeUrl: 'https://storage.placement.edu/resumes/sneha_reddy.pdf',
      phone: '+91 98765 43213',
      bio: 'Backend enthusiast specializing in high-throughput enterprise systems.',
      placementStatus: 'unplaced',
    });

    const profile5 = await StudentProfile.create({
      user: student5._id,
      rollNo: '22ME032',
      course: 'B.Tech',
      department: 'Mechanical Engineering',
      graduationYear: 2026,
      cgpa: 6.8,
      skills: ['SolidWorks', 'AutoCAD', 'Python', 'MATLAB', 'Data Analysis'],
      resumeUrl: 'https://storage.placement.edu/resumes/vikram_singh.pdf',
      phone: '+91 98765 43214',
      bio: 'Mechanical engineer with strong computational modeling and robotics interest.',
      placementStatus: 'unplaced',
    });

    console.log('Seeding Companies...');
    const companyGoogle = await Company.create({
      name: 'Google Cloud Technologies',
      description: 'Global leader in internet search, cloud computing, artificial intelligence, and operating systems.',
      website: 'https://cloud.google.com',
      location: 'Bengaluru / Hyderabad',
      industry: 'Cloud & AI',
      contactEmail: 'campus-hiring@google.com',
      recruiter: recruiterGoogle._id,
    });

    const companyMicrosoft = await Company.create({
      name: 'Microsoft Innovation Labs',
      description: 'Empowering every person and organization on the planet to achieve more through world-class software.',
      website: 'https://microsoft.com',
      location: 'Hyderabad / Noida',
      industry: 'Enterprise Software & Cloud',
      contactEmail: 'university@microsoft.com',
      recruiter: recruiterMicrosoft._id,
    });

    const companyAmazon = await Company.create({
      name: 'Amazon Web Services',
      description: 'World comprehensive and broadly adopted cloud platform offering over 200 fully featured services.',
      website: 'https://aws.amazon.com',
      location: 'Bengaluru / Chennai',
      industry: 'E-commerce & Cloud Services',
      contactEmail: 'aws-campus@amazon.com',
      recruiter: recruiterAmazon._id,
    });

    console.log('Seeding Jobs...');
    const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const job1 = await Job.create({
      title: 'Software Development Engineer - I (SDE 1)',
      company: companyGoogle._id,
      recruiter: recruiterGoogle._id,
      description: 'Join Google Cloud engineering team to architect, build, and deploy resilient scalable services for millions of worldwide enterprises.',
      minCgpa: 8.0,
      eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication'],
      requiredSkills: ['Data Structures', 'Algorithms', 'Go', 'Java', 'Python', 'Distributed Systems'],
      salary: 24.5,
      location: 'Bengaluru, India',
      jobType: 'Full-time',
      deadline: futureDate(30),
      openings: 5,
      status: 'active',
    });

    const job2 = await Job.create({
      title: 'Cloud Solutions Associate',
      company: companyGoogle._id,
      recruiter: recruiterGoogle._id,
      description: 'Partner with technical customers to troubleshoot complex infrastructure problems and guide architecture on Google Cloud Platform.',
      minCgpa: 7.5,
      eligibleDepartments: ['Computer Science', 'Information Technology'],
      requiredSkills: ['Linux', 'Networking', 'Cloud Fundamentals', 'Python', 'Bash'],
      salary: 18.0,
      location: 'Hyderabad, India',
      jobType: 'Full-time',
      deadline: futureDate(25),
      openings: 8,
      status: 'active',
    });

    const job3 = await Job.create({
      title: 'Full Stack Software Engineer',
      company: companyMicrosoft._id,
      recruiter: recruiterMicrosoft._id,
      description: 'Design intuitive, responsive user experiences backed by scalable cloud microservices across Microsoft 365 and Azure platforms.',
      minCgpa: 7.5,
      eligibleDepartments: ['Computer Science', 'Information Technology'],
      requiredSkills: ['React', 'TypeScript', 'C#', '.NET Core', 'Azure', 'REST APIs'],
      salary: 22.0,
      location: 'Hyderabad, India',
      jobType: 'Full-time',
      deadline: futureDate(45),
      openings: 6,
      status: 'active',
    });

    const job4 = await Job.create({
      title: 'AI & Machine Learning Engineer',
      company: companyMicrosoft._id,
      recruiter: recruiterMicrosoft._id,
      description: 'Collaborate with researchers to deploy cutting-edge foundation models into productive copilot solutions across enterprise applications.',
      minCgpa: 8.0,
      eligibleDepartments: ['Computer Science', 'Information Technology'],
      requiredSkills: ['Python', 'PyTorch', 'Large Language Models', 'FastAPI', 'Azure AI'],
      salary: 26.0,
      location: 'Noida, India',
      jobType: 'Full-time',
      deadline: futureDate(20),
      openings: 3,
      status: 'active',
    });

    const job5 = await Job.create({
      title: 'Cloud Support Associate',
      company: companyAmazon._id,
      recruiter: recruiterAmazon._id,
      description: 'Provide technical assistance and architecture optimization to AWS customers regarding compute, storage, security, and databases.',
      minCgpa: 7.0,
      eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering'],
      requiredSkills: ['Operating Systems', 'Networking', 'AWS', 'Shell Scripting', 'Troubleshooting'],
      salary: 14.5,
      location: 'Bengaluru, India',
      jobType: 'Full-time',
      deadline: futureDate(35),
      openings: 12,
      status: 'active',
    });

    const job6 = await Job.create({
      title: 'Systems & DevOps Engineer Intern',
      company: companyAmazon._id,
      recruiter: recruiterAmazon._id,
      description: 'Build CI/CD automation pipelines, maintain observability stacks, and enhance deployment safety across global e-commerce systems.',
      minCgpa: 7.0,
      eligibleDepartments: ['Computer Science', 'Information Technology'],
      requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Git', 'Python'],
      salary: 12.0,
      location: 'Chennai, India',
      jobType: 'Internship',
      deadline: futureDate(15),
      openings: 4,
      status: 'active',
    });

    console.log('Seeding Applications...');
    // Student 1 (Aarav) applied to Job 1 (Google SDE) -> Shortlisted
    await JobApplication.create({
      student: student1._id,
      studentProfile: profile1._id,
      job: job1._id,
      appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'shortlisted',
      coverLetter: 'I have strong algorithmic foundations and built distributed microservices during my internship.',
      recruiterRemarks: 'Strong technical profile. Coding round cleared with 98% score. Scheduled for technical interview.',
    });

    // Student 1 applied to Job 3 (Microsoft Full Stack) -> Pending
    await JobApplication.create({
      student: student1._id,
      studentProfile: profile1._id,
      job: job3._id,
      appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
      coverLetter: 'Experienced in React, TypeScript, and modern backend services with high code quality standards.',
      recruiterRemarks: '',
    });

    // Student 2 (Ananya) applied to Job 1 (Google SDE) -> Selected!
    await JobApplication.create({
      student: student2._id,
      studentProfile: profile2._id,
      job: job1._id,
      appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'selected',
      coverLetter: 'Passionate about machine learning at scale and distributed cloud services.',
      recruiterRemarks: 'Exceptional performance in algorithmic design and system design rounds. Offer letter issued at 24.5 LPA.',
    });

    // Student 4 (Sneha) applied to Job 3 (Microsoft Full Stack) -> Shortlisted
    await JobApplication.create({
      student: student4._id,
      studentProfile: profile4._id,
      job: job3._id,
      appliedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      status: 'shortlisted',
      coverLetter: 'Extensive hands-on expertise with Spring Boot and cloud-native microservices.',
      recruiterRemarks: 'Resume shortlisted based on backend expertise. Technical interview scheduled.',
    });

    // Student 3 (Rohit) applied to Job 5 (AWS Support) -> Pending
    await JobApplication.create({
      student: student3._id,
      studentProfile: profile3._id,
      job: job5._id,
      appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'pending',
      coverLetter: 'Strong fundamentals in computer networks, Linux systems, and hardware-software interaction.',
      recruiterRemarks: '',
    });

    // Student 5 (Vikram) applied to Job 5 (AWS Support) -> Rejected
    await JobApplication.create({
      student: student5._id,
      studentProfile: profile5._id,
      job: job5._id,
      appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'rejected',
      coverLetter: 'Eager to transition engineering skills to enterprise cloud infrastructure.',
      recruiterRemarks: 'Profile did not meet required networking depth for this cycle. Encouraged to apply for future cohorts.',
    });

    console.log('Database seeding completed successfully!');
    console.log('\n--- DEMO USER CREDENTIALS ---');
    console.log('1. Admin:');
    console.log('   Email:    admin@placement.edu');
    console.log('   Password: AdminPassword@123');
    console.log('\n2. Recruiter (Google):');
    console.log('   Email:    recruiter@google.com');
    console.log('   Password: RecruiterPassword@123');
    console.log('\n3. Recruiter (Microsoft):');
    console.log('   Email:    recruiter@microsoft.com');
    console.log('   Password: RecruiterPassword@123');
    console.log('\n4. Student (Aarav Mehta - Unplaced):');
    console.log('   Email:    student@placement.edu');
    console.log('   Password: StudentPassword@123');
    console.log('\n5. Student (Ananya Patel - Placed at Google):');
    console.log('   Email:    ananya.patel@placement.edu');
    console.log('   Password: StudentPassword@123');
    console.log('-----------------------------\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
