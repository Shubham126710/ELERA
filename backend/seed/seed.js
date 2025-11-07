import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import Question from "../models/Question.js";
import Course from "../models/Course.js";
import Rule from "../models/Rule.js";
import Learner from "../models/Learner.js";

dotenv.config();
await connectDB();

await Question.deleteMany({});
await Rule.deleteMany({});
await Learner.deleteMany({});
await Course.deleteMany({});

// Define courses and their subjects
const courses = [
  { name: "DBMS", code: "DBMS", subjects: ["ER Model", "Normalization", "SQL Basics"] },
  { name: "DSA", code: "DSA", subjects: ["Arrays", "Stacks", "Queues"] },
  { name: "Operating Systems", code: "OS", subjects: [] },
  { name: "Discrete Maths", code: "DM", subjects: [] },
  { name: "Machine Learning", code: "ML", subjects: [] },
  { name: "Computer Networks", code: "CN", subjects: [] },
  { name: "Predictive Analytics", code: "PA", subjects: [] },
  { name: "Full Stack", code: "FS", subjects: [] },
];
await Course.insertMany(courses);

const topicsByCourse = {
  DBMS: ["ER Model", "Normalization", "SQL Basics"],
  DSA: ["Arrays", "Stacks", "Queues"],
};

const questions = [];

// Standard sample MCQs
const standard = [
  // DBMS realistic-ish samples
  { course: "DBMS", topic: "ER Model", difficulty: "easy", text: "In ER modeling, a relationship typically connects", options:["Two or more entities","An entity and an attribute","Two attributes","A key and a tuple"], correctAnswer:"Two or more entities" },
  { course: "DBMS", topic: "Normalization", difficulty: "medium", text: "Third Normal Form (3NF) aims to remove", options:["Partial dependencies","Transitive dependencies","Multi-valued attributes","Primary keys"], correctAnswer:"Transitive dependencies" },
  { course: "DBMS", topic: "SQL Basics", difficulty: "easy", text: "Which clause is used to filter rows in SQL?", options:["SELECT","FROM","WHERE","GROUP"], correctAnswer:"WHERE" },
  { course: "DBMS", topic: "Normalization", difficulty: "hard", text: "A table violates BCNF when", options:["It has no candidate keys","A non-trivial functional dependency has a determinant that is not a superkey","It contains NULL values","It has more than one primary key"], correctAnswer:"A non-trivial functional dependency has a determinant that is not a superkey" },
  // DSA
  { course: "DSA", topic: "Arrays", difficulty: "easy", text: "Access time of an array element by index is typically", options:["O(1)","O(n)","O(log n)","O(n log n)"], correctAnswer:"O(1)" },
  { course: "DSA", topic: "Stacks", difficulty: "easy", text: "Stacks follow which principle?", options:["FIFO","LIFO","Random","Priority"], correctAnswer:"LIFO" },
  { course: "DSA", topic: "Queues", difficulty: "easy", text: "Queues follow which principle?", options:["LIFO","FIFO","Random","Circular"], correctAnswer:"FIFO" },
  { course: "DSA", topic: "Queues", difficulty: "medium", text: "An efficient structure for implementing a queue with O(1) amortized enqueue/dequeue is", options:["Two stacks","A min-heap","A sorted array","Binary search tree"], correctAnswer:"Two stacks" },
  // --- Added curated DBMS questions ---
  { course: "DBMS", topic: "ER Model", difficulty: "medium", text: "The cardinality that represents many-to-many between two entities is", options:["1:1","1:N","M:N","N:1"], correctAnswer:"M:N", hints:["Think about participation counts."], explanation:"Many-to-many is denoted M:N meaning multiple instances relate on both sides." },
  { course: "DBMS", topic: "ER Model", difficulty: "hard", text: "A weak entity is fully identified by", options:["Its own partial key only","A foreign key from any entity","A combination of its partial key and the owner's key","A surrogate key"], correctAnswer:"A combination of its partial key and the owner's key", hints:["Requires owner for uniqueness."], explanation:"Weak entities rely on an identifying relationship with an owner entity: partial key + owner's key." },
  { course: "DBMS", topic: "Normalization", difficulty: "easy", text: "Which normal form removes partial dependency on a composite key?", options:["1NF","2NF","3NF","BCNF"], correctAnswer:"2NF", hints:["Composite key dependencies"], explanation:"2NF eliminates partial dependencies—attributes depending on part of a composite primary key." },
  { course: "DBMS", topic: "SQL Basics", difficulty: "medium", text: "What does COUNT(*) return when used with no WHERE clause?", options:["Number of columns","Number of non-NULL rows","Total rows","Number of distinct rows"], correctAnswer:"Total rows", explanation:"COUNT(*) counts every row regardless of NULLs." },
  { course: "DBMS", topic: "SQL Basics", difficulty: "hard", text: "Default sort order for ORDER BY without ASC/DESC is", options:["Descending","Ascending","Unspecified","Engine dependent"], correctAnswer:"Ascending", explanation:"Standard SQL defaults to ascending order." },
  // --- Added curated DSA questions ---
  { course: "DSA", topic: "Arrays", difficulty: "medium", text: "Rotating an array by k using reversal algorithm runs in", options:["O(k)","O(n)","O(n log n)","O(1)"], correctAnswer:"O(n)", explanation:"Three reversals each O(n) → overall O(n)." },
  { course: "DSA", topic: "Arrays", difficulty: "hard", text: "Finding the majority element via Boyer–Moore has space complexity", options:["O(n)","O(log n)","O(1)","O(k)"], correctAnswer:"O(1)", explanation:"Tracks only a candidate and a counter." },
  { course: "DSA", topic: "Stacks", difficulty: "medium", text: "Which operation observes the top without removal?", options:["pop","push","peek","flush"], correctAnswer:"peek", explanation:"Peek returns top element, keeping stack unchanged." },
  { course: "DSA", topic: "Stacks", difficulty: "hard", text: "Using two queues to implement a stack can make which operation O(n)?", options:["push","pop","peek","size"], correctAnswer:"pop", explanation:"One variant moves all elements to get last inserted, making pop O(n)." },
  { course: "DSA", topic: "Queues", difficulty: "hard", text: "Condition for full in a circular array queue of size n using front/rear indexes is typically", options:["front === rear","(rear + 1) % n === front","rear === n","front === -1"], correctAnswer:"(rear + 1) % n === front", explanation:"Next position wrapping to front indicates no free slot." },
];

// Generate additional generic items to fill the bank
Object.entries(topicsByCourse).forEach(([courseName, topics]) => {
  topics.forEach((topic) => {
    for (let d of ["easy", "medium", "hard"]) {
  for (let i = 1; i <= 6; i++) {
        // Slightly varied placeholder options referencing topic & difficulty
        const opts = [
          `${topic} concept`,
          `${d} case`,
          `${topic} edge`,
          `${d} distractor`
        ];
        const correct = opts[0];
        questions.push({
          course: courseName,
          text: `${topic} ${d} practice #${i}`,
          type: "mcq",
          options: opts,
          correctAnswer: correct,
          hints: ["Consider the basic formula.", "Eliminate clearly wrong choices."],
          explanation: `Explanation for ${topic} ${d} #${i}.`,
          topic,
          difficulty: d,
          bloomLevel: d === "hard" ? "Apply" : d === "medium" ? "Understand" : "Remember",
          skills: [topic.toLowerCase()],
          outcomes: ["problem-solving"],
        });
      }
    }
  });
});

await Question.insertMany([...standard, ...questions]);
// Remove duplicate insert

await Rule.insertMany([
  {
    topic: "ER Model",
    cooldownMins: 120,
    conditions: [
      { ifExpr: "mastery < 0.5", nextDifficulty: "easy" },
      { ifExpr: "mastery >= 0.5 && mastery < 0.85", nextDifficulty: "medium" },
      { ifExpr: "mastery >= 0.85", nextDifficulty: "hard" },
    ],
  },
  {
    topic: "Normalization",
    cooldownMins: 120,
    conditions: [
      { ifExpr: "mastery < 0.5", nextDifficulty: "easy" },
      { ifExpr: "mastery >= 0.5 && mastery < 0.85", nextDifficulty: "medium" },
      { ifExpr: "mastery >= 0.85", nextDifficulty: "hard" },
    ],
  },
  {
    topic: "SQL Basics",
    cooldownMins: 120,
    conditions: [
      { ifExpr: "mastery < 0.5", nextDifficulty: "easy" },
      { ifExpr: "mastery >= 0.5 && mastery < 0.8", nextDifficulty: "medium" },
      { ifExpr: "mastery >= 0.8", nextDifficulty: "hard" },
    ],
  },
  {
    topic: "Arrays",
    cooldownMins: 120,
    conditions: [
      { ifExpr: "mastery < 0.5", nextDifficulty: "easy" },
      { ifExpr: "mastery >= 0.5 && mastery < 0.8", nextDifficulty: "medium" },
      { ifExpr: "mastery >= 0.8", nextDifficulty: "hard" },
    ],
  },
  {
    topic: "Stacks",
    cooldownMins: 120,
    conditions: [
      { ifExpr: "mastery < 0.5", nextDifficulty: "easy" },
      { ifExpr: "mastery >= 0.5 && mastery < 0.8", nextDifficulty: "medium" },
      { ifExpr: "mastery >= 0.8", nextDifficulty: "hard" },
    ],
  },
  {
    topic: "Queues",
    cooldownMins: 120,
    conditions: [
      { ifExpr: "mastery < 0.5", nextDifficulty: "easy" },
      { ifExpr: "mastery >= 0.5 && mastery < 0.8", nextDifficulty: "medium" },
      { ifExpr: "mastery >= 0.8", nextDifficulty: "hard" },
    ],
  },
]);

const hashed = await bcrypt.hash("password", 10);
await Learner.create([
  {
    name: "Demo User",
    email: "demo@elera.test",
    password: hashed,
    role: "student",
    mastery: [
      { topic: "ER Model", score: 0.45 },
      { topic: "Normalization", score: 0.6 },
      { topic: "Arrays", score: 0.5 },
    ],
  },
  {
    name: "Instructor One",
    email: "instructor@elera.test",
    password: hashed,
    role: "instructor",
    mastery: [],
  },
]);

console.log("Seeding done");
process.exit(0);