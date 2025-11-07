import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import connectDB from '../config/db.js';
import Learner from '../models/Learner.js';
import Question from '../models/Question.js';
import Course from '../models/Course.js';
import Rule from '../models/Rule.js';

// Helper to ensure DB connected for test env
beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
  process.env.NODE_ENV = 'test';
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Minimal seed for flow
beforeEach(async () => {
  await Learner.deleteMany({});
  await Question.deleteMany({});
  await Course.deleteMany({});
  await Rule.deleteMany({});

  await Course.create({ name: 'Mathematics', code: 'MATH', subjects: ['Algebra'] });
  await Question.create({
    course: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'easy',
    text: 'Solve: x + 2 = 4',
    type: 'mcq',
    options: ['1', '2'],
    correctAnswer: '2'
  });
  await Rule.create({
    topic: 'Algebra',
    cooldownMins: 5,
    conditions: [
      { ifExpr: 'mastery < 0.6', nextDifficulty: 'easy' },
      { ifExpr: 'mastery >= 0.6', nextDifficulty: 'medium' }
    ]
  });
});

describe('Auth + Quiz flow', () => {
  it('registers, logs in, lists courses, gets next question, submits answer', async () => {
    // Register
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'pw12345' })
      .expect(200);
    expect(regRes.body.learner.email).toBe('test@example.com');

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'pw12345' })
      .expect(200);
    const token = loginRes.body.token;
    const learnerId = loginRes.body.learner._id;
    expect(token).toBeTruthy();

    // Courses
    const coursesRes = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(coursesRes.body.courses.length).toBe(1);

    // Next question
    const nextRes = await request(app)
      .post('/api/quiz/next')
      .set('Authorization', `Bearer ${token}`)
      .send({ learnerId, course: 'Mathematics', topic: 'Algebra' })
      .expect(200);
    expect(nextRes.body.question.text).toMatch(/Solve/);

    // Submit answer (correct)
    const submitRes = await request(app)
      .post('/api/quiz/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ learnerId, questionId: nextRes.body.question._id, selectedOption: '2', topic: 'Algebra', difficulty: 'easy' })
      .expect(200);
    expect(submitRes.body.isCorrect).toBe(true);
    expect(typeof submitRes.body.newMastery).toBe('number');
  });
});
