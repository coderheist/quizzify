import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Trophy, Clock, CheckCircle, XCircle, RotateCcw, Home, Brain, Target, TrendingUp } from 'lucide-react';
import { QuizResult } from '../services/aiService';

interface QuizResult {
  score: number;
  percentage: number;
  timeSpent: number;
  results: Array<{
    questionId: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    timeTaken?: number;
  }>;
  feedback: string;
  detailedAnalysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

interface Quiz {
  _id: string;
  title: string;
  questions: Array<{
    _id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, quiz }: { result: QuizResult; quiz: Quiz } = location.state || {};

  if (!result || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No results found</h2>
          <Link
            to="/quizzes"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBgColor(result.percentage)} mb-4`}>
            <Trophy className={`h-10 w-10 ${getScoreColor(result.percentage)}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
          <p className="text-lg text-gray-600">{quiz.title}</p>
        </div>

        {/* Score Summary */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(result.percentage)} mb-2`}>
                {result.percentage}%
              </div>
              <p className="text-gray-600">Overall Score</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {result.score}/{quiz.questions.length}
              </div>
              <p className="text-gray-600">Correct Answers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {formatTime(result.timeSpent)}
              </div>
              <p className="text-gray-600">Time Taken</p>
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">AI</span>
            </span>
            Personalized Feedback
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">{result.feedback}</p>
          </div>
        </div>

        {/* Detailed Analysis */}
        {result.detailedAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Strengths */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {result.detailedAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Focus Areas</h3>
              </div>
              <ul className="space-y-2">
                {result.detailedAnalysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <XCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {result.detailedAnalysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {/* Question Review */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h2>
          <div className="space-y-6">
            {quiz.questions.map((question, index) => {
              const questionResult = result.results[index];
              const isCorrect = questionResult?.isCorrect;
              
              return (
                <div key={question._id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCorrect ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {index + 1}. {question.question}
                      </h3>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => {
                          const isUserAnswer = questionResult?.userAnswer === optionIndex;
                          const isCorrectAnswer = question.correctAnswer === optionIndex;
                          
                          let optionClass = 'p-3 rounded-lg border ';
                          if (isCorrectAnswer) {
                            optionClass += 'bg-green-50 border-green-200 text-green-800';
                          } else if (isUserAnswer && !isCorrect) {
                            optionClass += 'bg-red-50 border-red-200 text-red-800';
                          } else {
                            optionClass += 'bg-gray-50 border-gray-200 text-gray-700';
                          }
                          
                          return (
                            <div key={optionIndex} className={optionClass}>
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                <div className="flex space-x-2">
                                  {isCorrectAnswer && (
                                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                                      Correct
                                    </span>
                                  )}
                                  {isUserAnswer && (
                                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                                      Your Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(`/quiz/${quiz._id}`)}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Retake Quiz</span>
          </button>
          <Link
            to="/quizzes"
            className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            <span>Browse More Quizzes</span>
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;