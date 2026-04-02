import pool from './db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

const MODULES = [
  { title: 'Budgeting Basics', description: 'Learn the 50/30/20 rule and how to create your first budget.', category: 'Budgeting', duration: '25 min', difficulty: 'Beginner', xp_reward: 150, lessons: 5, color: '#22c55e' },
  { title: 'Smart Saving Strategies', description: 'Discover proven techniques to save money as a student.', category: 'Saving', duration: '30 min', difficulty: 'Beginner', xp_reward: 200, lessons: 6, color: '#3b82f6' },
  { title: 'Understanding Credit', description: 'Build credit responsibly and avoid common pitfalls.', category: 'Credit', duration: '40 min', difficulty: 'Intermediate', xp_reward: 250, lessons: 8, color: '#f97316' },
  { title: 'Investing 101', description: 'Start your investment journey with stocks, ETFs, and more.', category: 'Investing', duration: '45 min', difficulty: 'Intermediate', xp_reward: 300, lessons: 9, color: '#a855f7' },
  { title: 'Student Loans Decoded', description: 'Navigate federal vs private loans and repayment options.', category: 'Loans', duration: '35 min', difficulty: 'Intermediate', xp_reward: 250, lessons: 7, color: '#ec4899' },
  { title: 'Tax Basics for Students', description: 'File your first tax return with confidence.', category: 'Taxes', duration: '50 min', difficulty: 'Advanced', xp_reward: 350, lessons: 10, color: '#14b8a6' },
]

const QUIZZES = [
  {
    moduleIndex: 0, title: 'Budgeting Basics Quiz', description: 'Test your knowledge of budgeting fundamentals.', xp_reward: 100, time_limit: 10, color: '#22c55e',
    questions: [
      { question: 'What does the 50/30/20 rule suggest for savings?', options: ['10%','20%','30%','50%'], correct_index: 1, explanation: 'The 50/30/20 rule allocates 20% of income to savings.' },
      { question: 'Which is a fixed expense?', options: ['Groceries','Entertainment','Rent','Clothing'], correct_index: 2, explanation: 'Rent stays the same each month.' },
      { question: 'What is a zero-based budget?', options: ['Spending nothing','Income minus expenses equals zero','Having no savings','Spending only cash'], correct_index: 1, explanation: 'Every dollar of income is assigned a purpose.' },
      { question: 'What percentage goes to needs in 50/30/20?', options: ['20%','30%','50%','60%'], correct_index: 2, explanation: '50% goes toward needs like housing and food.' },
      { question: 'Which feature helps track spending categories?', options: ['Calendar','Budget tracker','Note-taking','Calculator'], correct_index: 1, explanation: 'Budget trackers categorize spending.' },
    ],
  },
  {
    moduleIndex: 1, title: 'Saving Strategies Quiz', description: 'How well do you know saving techniques?', xp_reward: 120, time_limit: 8, color: '#3b82f6',
    questions: [
      { question: 'What is an emergency fund?', options: ['Vacation savings','3-6 months of expenses','Investment account','Credit card limit'], correct_index: 1, explanation: 'Covers 3-6 months of living expenses.' },
      { question: 'What is "paying yourself first"?', options: ['Buying luxury items','Saving before spending','Paying bills first','Investing in stocks'], correct_index: 1, explanation: 'Automatically saving before spending.' },
      { question: 'Which account earns the most interest?', options: ['Checking','Savings','High-yield savings','Piggy bank'], correct_index: 2, explanation: 'High-yield savings accounts offer higher APY.' },
      { question: 'What is compound interest?', options: ['Simple interest','Interest on interest','Fixed rate','Annual fee'], correct_index: 1, explanation: 'Earns interest on principal and prior interest.' },
    ],
  },
  {
    moduleIndex: 2, title: 'Credit Fundamentals Quiz', description: 'Understand credit scores and cards.', xp_reward: 150, time_limit: 12, color: '#f97316',
    questions: [
      { question: 'What is a good credit score range?', options: ['300-500','500-600','670-850','200-400'], correct_index: 2, explanation: '670-850 is considered good to excellent.' },
      { question: 'What factor most impacts your credit score?', options: ['Credit age','Payment history','Credit mix','New inquiries'], correct_index: 1, explanation: 'Payment history is 35% of your FICO score.' },
      { question: 'What is credit utilization?', options: ['Number of cards','Ratio of balance to limit','Credit age','Payment frequency'], correct_index: 1, explanation: 'Percentage of available credit you are using.' },
    ],
  },
]

export async function seedDB() {
  const [existing] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM modules')
  if ((existing[0] as RowDataPacket).cnt > 0) {
    console.log('[iBudget] ✅ Seed already done')
    return
  }

  const moduleIds: number[] = []
  for (const m of MODULES) {
    const [res] = await pool.execute<ResultSetHeader>(
      'INSERT INTO modules (title, description, category, duration, difficulty, xp_reward, lessons, color) VALUES (?,?,?,?,?,?,?,?)',
      [m.title, m.description, m.category, m.duration, m.difficulty, m.xp_reward, m.lessons, m.color]
    )
    moduleIds.push(res.insertId)
  }

  for (const q of QUIZZES) {
    const [qRes] = await pool.execute<ResultSetHeader>(
      'INSERT INTO quizzes (module_id, title, description, xp_reward, time_limit, color) VALUES (?,?,?,?,?,?)',
      [moduleIds[q.moduleIndex], q.title, q.description, q.xp_reward, q.time_limit, q.color]
    )
    for (const qq of q.questions) {
      await pool.execute(
        'INSERT INTO quiz_questions (quiz_id, question, options, correct_index, explanation) VALUES (?,?,?,?,?)',
        [qRes.insertId, qq.question, JSON.stringify(qq.options), qq.correct_index, qq.explanation]
      )
    }
  }

  console.log('[iBudget] ✅ Modules and quizzes seeded')
}
