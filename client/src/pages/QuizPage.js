import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, resultAPI } from '../services/api';
import Question from '../components/Question';
import Timer from '../components/Timer';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (id) {
      fetchQuiz(id);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchQuiz = async (quizId) => {
    try {
      const response = await quizAPI.getQuizById(quizId);
      if (response.data.success) {
        setQuiz(response.data.data.quiz);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
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
      const answersArray = quiz.questions.map((_, index) => answers[index] ?? -1);
      const response = await resultAPI.submitQuiz(quiz._id, answersArray, timeSpent);
      
      if (response.data.success) {
        // Navigate to results page with the result data
        navigate('/result', { 
          state: { 
            result: response.data.data,
            quiz: quiz
          }
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h2>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="card mb-8 fade-in">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-gray-600 mt-1">
                  {answeredQuestions} of {quiz.questions.length} questions answered
                </p>
              </div>
              <Timer initialTime={quiz.timeLimit} onTimeUp={handleTimeUp} />
            </div>
          </div>
        </div>

        {/* Question */}
        <Question
          question={currentQuestion}
          selectedAnswer={answers[currentQuestionIndex] ?? null}
          onAnswerSelect={handleAnswerSelect}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quiz.questions.length}
        />

        {/* Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 space-y-4 md:space-y-0">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full md:w-auto justify-center"
          >
            <FaArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex flex-wrap justify-center gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[index] !== undefined
                    ? 'bg-green-100 text-green-800'
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
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full md:w-auto justify-center"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" color="white" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="h-4 w-4" />
                  <span>Submit Quiz</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto justify-center"
            >
              <span>Next</span>
              <FaArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;