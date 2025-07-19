import React from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaQuestionCircle, FaStar, FaPlay } from 'react-icons/fa';

const QuizCard = ({ quiz }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <div className="card group hover:scale-105 transform transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {quiz.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)} flex-shrink-0 ml-2`}>
            {quiz.difficulty}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
          {quiz.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <FaQuestionCircle className="h-4 w-4" />
            <span>{quiz.questions?.length || quiz.questionCount || 0} questions</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaClock className="h-4 w-4" />
            <span>{formatTime(quiz.timeLimit)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {quiz.topic}
          </span>
          <Link
            to={`/quiz/${quiz._id}`}
            className="inline-flex items-center space-x-2 btn-primary text-sm px-4 py-2"
          >
            <FaPlay className="h-3 w-3" />
            <span>Start Quiz</span>
          </Link>
        </div>
        
        {/* Additional stats */}
        {quiz.attempts > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{quiz.attempts} attempts</span>
              {quiz.averageScore > 0 && (
                <div className="flex items-center space-x-1">
                  <FaStar className="h-3 w-3 text-yellow-500" />
                  <span>{quiz.averageScore}% avg</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;