import express from 'express';
import Result from '../models/Result.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/results
// @desc    Submit quiz answers and save results
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body;
    const userId = req.user._id;

    // Validation
    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quiz ID and answers array'
      });
    }

    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!quiz.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Quiz is no longer available'
      });
    }

    // Validate answers array length
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Number of answers must match number of questions'
      });
    }

    // Calculate score and prepare detailed results
    let score = 0;
    const detailedAnswers = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = answers[i];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score += 1;
      }

      detailedAnswers.push({
        questionId: question._id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      });
    }

    const percentage = Math.round((score / quiz.questions.length) * 100);

    // Generate AI feedback
    const generateFeedback = (percentage) => {
      if (percentage >= 80) {
        return "Excellent work! You have a strong understanding of the concepts. Your performance shows solid mastery of the fundamentals. Keep up the great work and consider taking more advanced quizzes to further challenge yourself.";
      } else if (percentage >= 60) {
        return "Good job! You have a decent grasp of the material, but there's room for improvement. Review the topics you missed and practice more to strengthen your understanding. Focus on the areas where you made mistakes.";
      } else {
        return "You're on the right track, but need more practice. Don't get discouraged! Review the fundamental concepts, take your time to understand each topic thoroughly, and try taking the quiz again when you feel more confident.";
      }
    };

    // Create result record
    const result = new Result({
      userId,
      quizId,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      timeSpent: timeSpent || 0,
      answers: detailedAnswers,
      feedback: generateFeedback(percentage)
    });

    await result.save();

    // Update quiz statistics
    await quiz.incrementAttempts();

    // Update user statistics
    const user = await User.findById(userId);
    user.quizzesTaken.push({
      quizId,
      score: percentage,
      completedAt: new Date()
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Quiz results saved successfully',
      data: {
        score,
        percentage,
        timeSpent: result.timeSpent,
        results: detailedAnswers,
        feedback: result.feedback
      }
    });
  } catch (error) {
    console.error('Submit results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz results',
      error: error.message
    });
  }
});

// @route   GET /api/results/user/:userId
// @desc    Get user's quiz history
// @access  Private (Own results or Admin)
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permissions
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these results'
      });
    }

    const results = await Result.find({ userId })
      .populate('quizId', 'title topic difficulty')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: { results }
    });
  } catch (error) {
    console.error('Get user results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user results',
      error: error.message
    });
  }
});

export default router;