import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import QuizCard from '../components/QuizCard';
import Spinner from '../components/Spinner';
import { FaBrain, FaUsers, FaTrophy, FaBolt, FaSearch, FaFilter } from 'react-icons/fa';

const HomePage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getAllQuizzes();
      if (response.data.success) {
        setQuizzes(response.data.data.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || quiz.topic === selectedTopic;
    const matchesDifficulty = !selectedDifficulty || quiz.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  const topics = [...new Set(quizzes.map(quiz => quiz.topic))];
  const difficulties = [...new Set(quizzes.map(quiz => quiz.difficulty))];

  const features = [
    {
      icon: FaBrain,
      title: 'AI-Powered Feedback',
      description: 'Get personalized insights and explanations for every answer'
    },
    {
      icon: FaUsers,
      title: 'Multiple Topics',
      description: 'Test your knowledge across various programming and tech topics'
    },
    {
      icon: FaTrophy,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed score analytics'
    },
    {
      icon: FaBolt,
      title: 'Real-time Scoring',
      description: 'Instant feedback and results as soon as you complete a quiz'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Master Your Skills with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Quizzes
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Challenge yourself with interactive quizzes and receive personalized AI feedback 
              to accelerate your learning journey in programming and technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#quizzes"
                className="btn-primary text-lg px-8 py-4"
              >
                Start Learning Now
              </a>
              <Link
                to="/register"
                className="btn-secondary text-lg px-8 py-4"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-16 h-16 bg-green-400 rounded-full opacity-10 animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose AI Quiz?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of learning with our intelligent quiz platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card hover:scale-105 transform transition-all duration-300 fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quizzes Section */}
      <div id="quizzes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Available Quizzes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from a variety of quizzes to test and improve your knowledge
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-8 fade-in">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
              
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="form-input"
              >
                <option value="">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="form-input"
              >
                <option value="">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No quizzes found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredQuizzes.map((quiz, index) => (
              <div
                key={quiz._id}
                className="fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <QuizCard quiz={quiz} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Test Your Knowledge?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are already improving their skills with our AI-powered platform
            </p>
            <a
              href="#quizzes"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 inline-block"
            >
              Browse Quizzes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;