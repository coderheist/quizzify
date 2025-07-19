import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaTrophy, FaClock, FaCheckCircle, FaTimesCircle, FaRedo, FaHome } from 'react-icons/fa';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, quiz } = location.state || {};

  if (!result || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No results found</h2>
          <Link
            to="/"
            className="btn-primary"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    return 'F';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBgColor(result.percentage)} mb-4`}>
            <FaTrophy className={`h-10 w-10 ${getScoreColor(result.percentage)}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
          <p className="text-lg text-gray-600">{quiz.title}</p>
        </div>

        {/* Score Summary */}
        <div className="card mb-8 fade-in">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className={`text-4xl font-bold ${getScoreColor(result.percentage)} mb-2`}>
                  {result.percentage}%
                </div>
                <p className="text-gray-600">Overall Score</p>
                <p className="text-sm text-gray-500 mt-1">Grade: {getGrade(result.percentage)}</p>
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
        </div>

        {/* AI Feedback */}
        {result.feedback && (
          <div className="card mb-8 fade-in">
            <div className="p-8">
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
          </div>
        )}

        {/* Question Review */}
        <div className="card mb-8 fade-in">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h2>
            <div className="space-y-6">
              {quiz.questions.map((question, index) => {
                const questionResult = result.results[index];
                const isCorrect = questionResult?.isCorrect;
                
                return (
                  <div key={question._id || index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {isCorrect ? (
                          <FaCheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <FaTimesCircle className="h-5 w-5 text-red-600" />
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
          <button
            onClick={() => navigate(`/quiz/${quiz._id}`)}
            className="flex items-center justify-center space-x-2 btn-primary px-8 py-3"
          >
            <FaRedo className="h-5 w-5" />
            <span>Retake Quiz</span>
          </button>
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 btn-secondary px-8 py-3"
          >
            <FaHome className="h-5 w-5" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;