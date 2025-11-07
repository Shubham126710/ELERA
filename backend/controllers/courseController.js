import Course from "../models/Course.js";
import Question from "../models/Question.js";

export const listCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).select("name code subjects").lean();
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listSubjects = async (req, res) => {
  try {
    const { course } = req.params;
    const subjects = await Question.distinct("topic", { course, isActive: true });
    res.json({ course, subjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listQuestions = async (req, res) => {
  try {
    const { course } = req.params;
    const { topic, difficulty } = req.query;
    const filter = { course, isActive: true };
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    const questions = await Question.find(filter).select("text topic difficulty type options hints explanation").lean();
    res.json({ count: questions.length, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Static learning paths for now; can be made dynamic later
const LEARNING_PATHS = {
  DBMS: [
    { id: 1, title: 'ER Model', topic: 'ER Model', description: 'Entities, relationships and schemas.' },
    { id: 2, title: 'Normalization', topic: 'Normalization', description: '1NF → 3NF forms and anomalies.' },
    { id: 3, title: 'SQL Basics', topic: 'SQL Basics', description: 'SELECT, WHERE, JOIN fundamentals.' }
  ],
  DSA: [
    { id: 1, title: 'Arrays', topic: 'Arrays', description: 'Indexing, traversal, complexity.' },
    { id: 2, title: 'Stacks', topic: 'Stacks', description: 'LIFO operations and use-cases.' },
    { id: 3, title: 'Queues', topic: 'Queues', description: 'FIFO ordering and variants.' }
  ]
};

export const getLearningPath = async (req, res) => {
  try {
    const { course } = req.params;
    const path = LEARNING_PATHS[course] || [];
    res.json({ course, path });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
