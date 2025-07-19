import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, Target, Zap, ArrowRight, Star, Users, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Generation',
      description: 'Advanced AI creates personalized quizzes from keywords or paragraphs instantly',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Sparkles,
      title: 'Smart Question Creation',
      description: 'Generate 5-20 questions with multiple choice options tailored to your content',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Paragraph Analysis',
      description: 'Upload text and get comprehensive quizzes based on the content using ML models',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get immediate feedback and detailed explanations for every answer',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Users' },
    { icon: Brain, value: '50K+', label: 'Quizzes Generated' },
    { icon: Trophy, value: '95%', label: 'Success Rate' },
    { icon: Star, value: '4.9', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full animate-bounce"></div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Create Quizzes with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                AI Magic
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform any keyword or paragraph into engaging quizzes instantly. 
              Powered by advanced AI and machine learning for the ultimate learning experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {user ? (
                <Link
                  to="/generate"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center space-x-3"
                >
                  <Sparkles className="h-6 w-6 group-hover:animate-spin" />
                  <span>Generate Quiz Now</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center space-x-3"
                  >
                    <Sparkles className="h-6 w-6 group-hover:animate-spin" />
                    <span>Get Started Free</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="group border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:bg-white/80 backdrop-blur-sm flex items-center space-x-3"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-pink-400/20 rounded-full blur-xl animate-float-slow"></div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful AI Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of quiz creation with our advanced AI technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-start space-x-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Create Amazing Quizzes?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Join thousands of educators and learners who are already using AI to create engaging quizzes
            </p>
            {user ? (
              <Link
                to="/generate"
                className="inline-flex items-center space-x-3 bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <Sparkles className="h-6 w-6" />
                <span>Start Generating</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center space-x-3 bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <Sparkles className="h-6 w-6" />
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;