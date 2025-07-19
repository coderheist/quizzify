import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create or connect to SQLite database
const db = new Database(join(__dirname, 'quiz.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
const initDB = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Quizzes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      topic TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium',
      questions TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Results table
  db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      quizId INTEGER NOT NULL,
      score INTEGER NOT NULL,
      totalQuestions INTEGER NOT NULL,
      answers TEXT NOT NULL,
      timeTaken INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (quizId) REFERENCES quizzes(id)
    )
  `);

  // Insert sample quizzes
  const insertQuiz = db.prepare(`
    INSERT OR IGNORE INTO quizzes (id, title, description, topic, difficulty, questions)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const sampleQuizzes = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      description: "Test your knowledge of JavaScript basics",
      topic: "Programming",
      difficulty: "beginner",
      questions: JSON.stringify([
        {
          id: 1,
          question: "What is the correct way to declare a variable in JavaScript?",
          options: ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
          correctAnswer: 0
        },
        {
          id: 2,
          question: "Which method is used to add an element to the end of an array?",
          options: ["push()", "add()", "append()", "insert()"],
          correctAnswer: 0
        },
        {
          id: 3,
          question: "What does '===' operator do in JavaScript?",
          options: ["Assignment", "Comparison without type checking", "Strict equality comparison", "Not equal"],
          correctAnswer: 2
        }
      ])
    },
    {
      id: 2,
      title: "React Basics",
      description: "Fundamental concepts of React.js",
      topic: "Frontend",
      difficulty: "intermediate",
      questions: JSON.stringify([
        {
          id: 1,
          question: "What is JSX?",
          options: ["A JavaScript library", "A syntax extension for JavaScript", "A database", "A CSS framework"],
          correctAnswer: 1
        },
        {
          id: 2,
          question: "Which hook is used for state management in functional components?",
          options: ["useEffect", "useState", "useContext", "useReducer"],
          correctAnswer: 1
        },
        {
          id: 3,
          question: "What is the virtual DOM?",
          options: ["A real DOM element", "A JavaScript representation of the real DOM", "A CSS framework", "A database"],
          correctAnswer: 1
        }
      ])
    },
    {
      id: 3,
      title: "Node.js Essentials",
      description: "Server-side JavaScript with Node.js",
      topic: "Backend",
      difficulty: "intermediate",
      questions: JSON.stringify([
        {
          id: 1,
          question: "What is Node.js?",
          options: ["A browser", "A JavaScript runtime", "A database", "A CSS framework"],
          correctAnswer: 1
        },
        {
          id: 2,
          question: "Which module is used to create a web server in Node.js?",
          options: ["fs", "http", "path", "url"],
          correctAnswer: 1
        },
        {
          id: 3,
          question: "What is npm?",
          options: ["Node Package Manager", "New Programming Method", "Network Protocol Manager", "Node Process Manager"],
          correctAnswer: 0
        }
      ])
    }
  ];

  sampleQuizzes.forEach(quiz => {
    insertQuiz.run(quiz.id, quiz.title, quiz.description, quiz.topic, quiz.difficulty, quiz.questions);
  });

  console.log('✅ Database initialized with sample data');
};

// Initialize the database
initDB();

export default db;