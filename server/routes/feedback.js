import express from 'express';
import Result from '../models/Result.js';
import Quiz from '../models/Quiz.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/feedback
// @desc    Generate AI feedback for quiz results
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { quizId, userAnswers, correctAnswers, score, totalQuestions } = req.body;

    // Validation
    if (!quizId || !userAnswers || !correctAnswers || score === undefined || !totalQuestions) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields for feedback generation'
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

    const percentage = Math.round((score / totalQuestions) * 100);

    // Generate detailed AI feedback based on performance
    let feedback = '';
    let recommendations = [];

    if (percentage >= 90) {
      feedback = `Outstanding performance! You scored ${percentage}% on the ${quiz.title} quiz. Your mastery of ${quiz.topic} concepts is exceptional. You demonstrate a deep understanding of the subject matter and consistently made excellent choices throughout the quiz.`;
      recommendations = [
        'Consider exploring advanced topics in this area',
        'Share your knowledge by helping others or creating content',
        'Look into real-world applications of these concepts'
      ];
    } else if (percentage >= 80) {
      feedback = `Excellent work! You scored ${percentage}% on the ${quiz.title} quiz. You have a strong grasp of ${quiz.topic} fundamentals with room for minor improvements. Your performance shows solid understanding with occasional gaps that can be easily addressed.`;
      recommendations = [
        'Review the specific areas where mistakes occurred',
        'Practice similar questions to reinforce learning',
        'Consider taking more advanced quizzes in this topic'
      ];
    } else if (percentage >= 70) {
      feedback = `Good job! You scored ${percentage}% on the ${quiz.title} quiz. You have a decent understanding of ${quiz.topic}, but there are some areas that need attention. With focused study on the missed topics, you can significantly improve your performance.`;
      recommendations = [
        'Review the incorrect answers and understand why they were wrong',
        'Study the specific topics you struggled with',
        'Take practice quizzes on similar topics',
        'Consider additional learning resources'
      ];
    } else if (percentage >= 60) {
      feedback = `You're making progress! You scored ${percentage}% on the ${quiz.title} quiz. While you have some understanding of ${quiz.topic}, there are significant areas for improvement. Don't be discouraged - this is a great learning opportunity.`;
      recommendations = [
        'Go back to study materials and review core concepts',
        'Take your time with each topic before moving to advanced areas',
        'Consider additional resources or tutorials',
        'Practice with easier questions first to build confidence'
      ];
    } else {
      feedback = `Keep learning! You scored ${percentage}% on the ${quiz.title} quiz. This indicates that you need to spend more time studying ${quiz.topic} fundamentals. Don't worry - everyone starts somewhere, and with dedicated effort, you can improve significantly.`;
      recommendations = [
        'Start with basic concepts and build up gradually',
        'Use multiple learning resources (videos, books, tutorials)',
        'Practice regularly with simpler questions first',
        'Consider getting help from instructors or study groups'
      ];
    }

    // Analyze specific mistakes
    const incorrectAnswers = [];
    for (let i = 0; i < userAnswers.length; i++) {
      if (userAnswers[i] !== correctAnswers[i]) {
        incorrectAnswers.push({
          questionIndex: i,
          userAnswer: userAnswers[i],
          correctAnswer: correctAnswers[i],
          question: quiz.questions[i]?.question || 'Question not found'
        });
      }
    }

    if (incorrectAnswers.length > 0) {
      feedback += `\n\nSpecific areas to focus on: You had difficulty with ${incorrectAnswers.length} question(s). Pay special attention to these concepts for improvement.`;
    }

    // This is where you would integrate with Gemini API in a real application
    // For now, we're using rule-based feedback generation
    
    res.json({
      success: true,
      message: 'AI feedback generated successfully',
      data: {
        feedback,
        recommendations,
        incorrectAnswers: incorrectAnswers.slice(0, 3), // Limit to first 3 for brevity
        overallPerformance: {
          score,
          percentage,
          grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F'
        }
      }
    });
  } catch (error) {
    console.error('Generate feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI feedback',
      error: error.message
    });
  }
});

export default router;