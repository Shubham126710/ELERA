import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import Learner from '../models/Learner.js'
import { getNextQuestion, submitAnswer } from '../controllers/quizController.js'

// Quick simulation invoking controllers directly
dotenv.config()
await connectDB()

const learner = await Learner.findOne({ email: 'demo@elera.test' })
if(!learner){
  console.error('Seed first.');
  process.exit(1)
}

function mockRes(){
  return {
    status(code){ this._code = code; return this },
    json(obj){ this._json = obj; this.done = true; },
  }
}

async function run(n=10){
  for(let i=0;i<n;i++){
    const reqN = { body: { learnerId: learner._id, mode: 'formative' }, headers: {}, user: { id: String(learner._id), role: 'student' } }
    const resN = mockRes();
    await getNextQuestion(reqN, resN)
    const q = resN._json?.question
    if(!q){ console.log('No question, stopping.'); break }
    const correct = Math.random() < 0.6
    const reqS = { body: { learnerId: learner._id, questionId: q._id, isCorrect: correct, topic: q.topic, difficulty: q.difficulty, selectedOption: correct ? q.correctAnswer : 'wrong', usedHint: Math.random()<0.2 }, headers: {}, user: { id: String(learner._id), role: 'student' } }
    const resS = mockRes();
    await submitAnswer(reqS, resS)
    process.stdout.write(correct ? '✅' : '❌')
  }
  console.log('\nDone.')
}

await run(20)
process.exit(0)
