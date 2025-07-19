import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Users, Trophy, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Feedback',
      description: 'Get personalized insights and explanations for every answer'
    },
    {
      icon: Users,
      title: 'Multiple Topics',
      description: 'Test your knowledge across various programming and tech topics'
    },
    {
      icon: Trophy,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed score analytics'
    },
    {
      icon: Zap,
      title: 'Real-time Scoring',
      description: 'Instant feedback and results as soon as you complete a quiz'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
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
              <Link
                to="/quizzes"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Start Learning Now
              </Link>
              <Link
                to="/register"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 hover:bg-gray-50"
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
        <div className="text-center mb-16">
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
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
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
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Test Your Knowledge?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are already improving their skills with our AI-powered platform
            </p>
            <Link
              to="/quizzes"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Browse Quizzes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;