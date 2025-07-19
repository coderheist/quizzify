import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, FileText, Sparkles, Settings, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateQuizFromKeyword, generateQuizFromParagraph } from '../services/aiService';

const QuizGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'keyword' | 'paragraph'>('keyword');
  const [keyword, setKeyword] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateFromKeyword = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    setIsGenerating(true);
    try {
      const quiz = await generateQuizFromKeyword(keyword, questionCount, difficulty);
      toast.success('Quiz generated successfully!');
      navigate('/quiz/generated', { state: { quiz } });
    } catch (error) {
      toast.error('Failed to generate quiz. Please try again.');
      console.error('Error generating quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromParagraph = async () => {
    if (!paragraph.trim()) {
      toast.error('Please enter a paragraph');
      return;
    }

    if (paragraph.length < 100) {
      toast.error('Paragraph should be at least 100 characters long');
      return;
    }

    setIsGenerating(true);
    try {
      const quiz = await generateQuizFromParagraph(paragraph, questionCount);
      toast.success('Quiz generated successfully!');
      navigate('/quiz/generated', { state: { quiz } });
    } catch (error) {
      toast.error('Failed to generate quiz. Please try again.');
      console.error('Error generating quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI Quiz Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create personalized quizzes instantly using advanced AI technology
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('keyword')}
              className={`flex-1 flex items-center justify-center space-x-3 py-6 px-8 text-lg font-semibold transition-all duration-300 ${
                activeTab === 'keyword'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Brain className="h-6 w-6" />
              <span>Keyword Based</span>
            </button>
            <button
              onClick={() => setActiveTab('paragraph')}
              className={`flex-1 flex items-center justify-center space-x-3 py-6 px-8 text-lg font-semibold transition-all duration-300 ${
                activeTab === 'paragraph'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="h-6 w-6" />
              <span>Paragraph Based</span>
            </button>
          </div>

          <div className="p-8">
            {/* Settings Panel */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200/50">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Quiz Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Number of Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>
                
                {activeTab === 'keyword' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Content Input */}
            {activeTab === 'keyword' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    Enter a Keyword or Topic
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g., JavaScript, Machine Learning, History..."
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-300"
                    disabled={isGenerating}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    AI will generate questions related to this topic
                  </p>
                </div>
                
                <button
                  onClick={handleGenerateFromKeyword}
                  disabled={isGenerating || !keyword.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-8 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Generating Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6" />
                      <span>Generate Quiz</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    Enter a Paragraph
                  </label>
                  <textarea
                    value={paragraph}
                    onChange={(e) => setParagraph(e.target.value)}
                    placeholder="Paste your text here... The AI will analyze the content and generate relevant questions."
                    rows={8}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-300 resize-none"
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">
                      Minimum 100 characters required
                    </p>
                    <span className={`text-sm font-medium ${
                      paragraph.length >= 100 ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {paragraph.length}/100
                    </span>
                  </div>
                </div>
                
                {paragraph.length > 0 && paragraph.length < 100 && (
                  <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Please provide more content for better question generation
                    </span>
                  </div>
                )}
                
                <button
                  onClick={handleGenerateFromParagraph}
                  disabled={isGenerating || paragraph.length < 100}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-8 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Analyzing & Generating...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-6 w-6" />
                      <span>Generate Quiz from Text</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Keyword Generation</h3>
            </div>
            <p className="text-gray-600">
              Enter any topic and our AI will create comprehensive questions with multiple choice answers, 
              perfect for testing knowledge on specific subjects.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Paragraph Analysis</h3>
            </div>
            <p className="text-gray-600">
              Upload any text content and our ML model will analyze it to generate relevant questions, 
              ideal for comprehension testing and content review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGeneratorPage;