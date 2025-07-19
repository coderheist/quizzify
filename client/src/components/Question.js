import React from 'react';

const Question = ({ 
  question, 
  selectedAnswer, 
  onAnswerSelect, 
  questionNumber, 
  totalQuestions 
}) => {
  return (
    <div className="card fade-in">
      <div className="p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-blue-600">
              Question {questionNumber} of {totalQuestions}
            </span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
            {question.question}
          </h2>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                selectedAnswer === index
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedAnswer === index && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="flex-1 text-sm leading-relaxed">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Question;