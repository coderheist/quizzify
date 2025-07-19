import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quizzes.js';
import resultRoutes from './routes/results.js';
import feedbackRoutes from './routes/feedback.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(limiter);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-quiz-app');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create sample data if database is empty
    await createSampleData();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create sample quizzes and admin user
const createSampleData = async () => {
  try {
    const Quiz = (await import('./models/Quiz.js')).default;
    const User = (await import('./models/User.js')).default;
    
    // Check if we already have data
    const quizCount = await Quiz.countDocuments();
    const userCount = await User.countDocuments();
    
    if (quizCount === 0) {
      // Create sample admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Sample admin user created (admin@example.com / admin123)');

      // Create sample quizzes
      const sampleQuizzes = [
        {
          title: 'JavaScript Fundamentals',
          description: 'Test your knowledge of JavaScript basics including variables, functions, and objects.',
          topic: 'Programming',
          difficulty: 'Beginner',
          timeLimit: 600,
          questions: [
            {
              question: 'What is the correct way to declare a variable in JavaScript?',
              options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
              correctAnswer: 0,
              explanation: 'The var keyword is used to declare variables in JavaScript.'
            },
            {
              question: 'Which method is used to add an element to the end of an array?',
              options: ['push()', 'pop()', 'shift()', 'unshift()'],
              correctAnswer: 0,
              explanation: 'The push() method adds one or more elements to the end of an array.'
            },
            {
              question: 'What does "typeof null" return in JavaScript?',
              options: ['null', 'undefined', 'object', 'string'],
              correctAnswer: 2,
              explanation: 'This is a known quirk in JavaScript where typeof null returns "object".'
            }
          ],
          createdBy: adminUser._id
        },
        {
          title: 'React Components',
          description: 'Learn about React components, props, and state management.',
          topic: 'Frontend',
          difficulty: 'Intermediate',
          timeLimit: 900,
          questions: [
            {
              question: 'What is the purpose of the useState hook in React?',
              options: ['To manage component state', 'To handle side effects', 'To create refs', 'To optimize performance'],
              correctAnswer: 0,
              explanation: 'useState is a React hook that allows you to add state to functional components.'
            },
            {
              question: 'How do you pass data from a parent to a child component?',
              options: ['Through state', 'Through props', 'Through context', 'Through refs'],
              correctAnswer: 1,
              explanation: 'Props are used to pass data from parent components to child components.'
            }
          ],
          createdBy: adminUser._id
        },
        {
          title: 'Database Concepts',
          description: 'Understanding database fundamentals, SQL queries, and data modeling.',
          topic: 'Backend',
          difficulty: 'Advanced',
          timeLimit: 1200,
          questions: [
            {
              question: 'What is a primary key in a database?',
              options: ['A foreign key reference', 'A unique identifier for rows', 'An index for faster queries', 'A constraint for data validation'],
              correctAnswer: 1,
              explanation: 'A primary key is a unique identifier for each row in a database table.'
            }
          ],
          createdBy: adminUser._id
        }
      ];

      for (const quizData of sampleQuizzes) {
        const quiz = new Quiz(quizData);
        await quiz.save();
      }
      
      console.log('✅ Sample quizzes created');
    }
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'AI Quiz Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/feedback', feedbackRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

export default app;