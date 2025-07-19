import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { GeneratedQuiz } from '../services/aiService';
import Question from '../components/Question';
import Timer from '../components/Timer';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Brain } from 'lucide-react';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Array<{
    _id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<Quiz | GeneratedQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if this is a generated quiz
    if (location.state?.quiz) {
      setQuiz(location.state.quiz);
      setLoading(false);
    } else if (id && id !== 'generated') {
      fetchQuiz(id);
    } else {
      navigate('/generate');
    }
  }, [id, user, navigate, location.state]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchQuiz = async (quizId: string) => {
    try {
      const response = await quizAPI.getQuizById(quizId);
      setQuiz(response.data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      navigate('/generate');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answerIndex
    });
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;

    setIsSubmitting(true);
    try {
      // Calculate results
      let score = 0;
      const results = quiz.questions.map((question, index) => {
        const userAnswer = answers[index] ?? -1;
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) score++;
        
        return {
          questionId: question._id || `q${index + 1}`,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect
        };
      });

      const percentage = Math.round((score / quiz.questions.length) * 100);
      
      // Generate feedback
      const generateFeedback = (percentage: number) => {
        if (percentage >= 90) {
          return "Outstanding performance! You have mastered this topic exceptionally well. Your deep understanding is evident from your excellent choices throughout the quiz.";
        } else if (percentage >= 80) {
          return "Excellent work! You have a strong grasp of the material with only minor areas for improvement. Keep up the great work!";
        } else if (percentage >= 70) {
          return "Good job! You have a solid understanding of the basics, but there are some concepts that could use more attention. Review the areas where you made mistakes.";
        } else if (percentage >= 60) {
          return "You're making progress! While you have some understanding, there are significant areas for improvement. Focus on studying the core concepts more thoroughly.";
        } else {
          return "Keep learning! This quiz shows you need to spend more time with the fundamentals. Don't be discouraged - everyone starts somewhere, and with dedicated study, you can improve significantly.";
        }
      };

      const result = {
        score,
        percentage,
        timeSpent,
        results,
        feedback: generateFeedback(percentage)
      };
      
      // Navigate to results page
      navigate('/result', { 
        state: { 
          result,
          quiz
        }
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading your quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h2>
          <button
            onClick={() => navigate('/generate')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Generate New Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const answeredQuestions = Object.keys(answers).length;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>{answeredQuestions} of {quiz.questions.length} answered</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Timer initialTime={quiz.timeLimit} onTimeUp={handleTimeUp} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <Question
            question={{
              _id: currentQuestion._id || `q${currentQuestionIndex + 1}`,
              question: currentQuestion.question,
              options: currentQuestion.options
            }}
            selectedAnswer={answers[currentQuestionIndex] ?? null}
            onAnswerSelect={handleAnswerSelect}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
          />
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 w-full md:w-auto justify-center"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            {/* Question Numbers */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    index === currentQuestionIndex
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                      : answers[index] !== undefined
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg w-full md:w-auto justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Submit Quiz</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg w-full md:w-auto justify-center"
              >
                <span>Next</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;