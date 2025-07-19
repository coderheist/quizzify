import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock data for demonstration
const mockQuizzes = [
  {
    _id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and objects.',
    topic: 'Programming',
    difficulty: 'Beginner',
    timeLimit: 600, // 10 minutes
    questions: [
      {
        _id: 'q1',
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
        correctAnswer: 0
      },
      {
        _id: 'q2',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 0
      },
      {
        _id: 'q3',
        question: 'What does "typeof null" return in JavaScript?',
        options: ['null', 'undefined', 'object', 'string'],
        correctAnswer: 2
      }
    ]
  },
  {
    _id: '2',
    title: 'React Components',
    description: 'Learn about React components, props, and state management.',
    topic: 'Frontend',
    difficulty: 'Intermediate',
    timeLimit: 900, // 15 minutes
    questions: [
      {
        _id: 'q4',
        question: 'What is the purpose of the useState hook in React?',
        options: ['To manage component state', 'To handle side effects', 'To create refs', 'To optimize performance'],
        correctAnswer: 0
      },
      {
        _id: 'q5',
        question: 'How do you pass data from a parent to a child component?',
        options: ['Through state', 'Through props', 'Through context', 'Through refs'],
        correctAnswer: 1
      }
    ]
  },
  {
    _id: '3',
    title: 'Database Concepts',
    description: 'Understanding database fundamentals, SQL queries, and data modeling.',
    topic: 'Backend',
    difficulty: 'Advanced',
    timeLimit: 1200, // 20 minutes
    questions: [
      {
        _id: 'q6',
        question: 'What is a primary key in a database?',
        options: ['A foreign key reference', 'A unique identifier for rows', 'An index for faster queries', 'A constraint for data validation'],
        correctAnswer: 1
      }
    ]
  }
];

// API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: { user: { id: '1', name: 'John Doe', email }, token: 'mock-token' } };
  },
  
  register: async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: { user: { id: '1', name, email }, token: 'mock-token' } };
  }
};

export const quizAPI = {
  getAllQuizzes: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { data: mockQuizzes };
  },
  
  getQuizById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const quiz = mockQuizzes.find(q => q._id === id);
    if (!quiz) throw new Error('Quiz not found');
    return { data: quiz };
  }
};

export const resultAPI = {
  submitQuiz: async (quizId: string, answers: number[], timeSpent: number) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const quiz = mockQuizzes.find(q => q._id === quizId);
    if (!quiz) throw new Error('Quiz not found');
    
    let score = 0;
    const results = answers.map((answer, index) => {
      const isCorrect = answer === quiz.questions[index].correctAnswer;
      if (isCorrect) score++;
      return {
        questionId: quiz.questions[index]._id,
        userAnswer: answer,
        correctAnswer: quiz.questions[index].correctAnswer,
        isCorrect
      };
    });
    
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    // Mock AI feedback
    const generateFeedback = (percentage: number) => {
      if (percentage >= 80) {
        return "Excellent work! You have a strong understanding of the concepts. Your performance shows solid mastery of the fundamentals. Keep up the great work and consider taking more advanced quizzes to further challenge yourself.";
      } else if (percentage >= 60) {
        return "Good job! You have a decent grasp of the material, but there's room for improvement. Review the topics you missed and practice more to strengthen your understanding. Focus on the areas where you made mistakes.";
      } else {
        return "You're on the right track, but need more practice. Don't get discouraged! Review the fundamental concepts, take your time to understand each topic thoroughly, and try taking the quiz again when you feel more confident.";
      }
    };
    
    return {
      data: {
        score,
        percentage,
        timeSpent,
        results,
        feedback: generateFeedback(percentage)
      }
    };
  }
};

export default api;