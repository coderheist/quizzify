import express from 'express';
import Quiz from '../models/Quiz.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/quizzes
// @desc    Get all quizzes with optional filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      topic,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;

    // Build query object
    const query = { isActive: true };
    
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort = { [sortBy]: parseInt(sortOrder) };

    // Execute query with pagination
    const quizzes = await Quiz.find(query)
      .select('-questions.explanation') // Exclude explanations for performance
      .populate('createdBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalQuizzes: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get a single quiz by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find quiz and populate creator info
    const quiz = await Quiz.findById(id)
      .populate('createdBy', 'name');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz is not available'
      });
    }

    res.json({
      success: true,
      data: { quiz }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
});

// @route   POST /api/quizzes
// @desc    Create a new quiz (Admin only)
// @access  Private (Admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      topic,
      difficulty,
      timeLimit,
      questions
    } = req.body;

    // Validation
    if (!title || !description || !topic || !difficulty || !questions) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quiz must have at least one question'
      });
    }

    // Create quiz
    const quiz = new Quiz({
      title,
      description,
      topic,
      difficulty,
      timeLimit: timeLimit || 600,
      questions,
      createdBy: req.user._id
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
});

export default router;