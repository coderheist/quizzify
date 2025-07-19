import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, LogOut, User, Home, Sparkles, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeMenu}>
            <div className="relative">
              <Brain className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Quiz Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-all duration-200 hover:scale-105"
            >
              <Home className="h-4 w-4" />
              <span className="font-medium">Home</span>
            </Link>
            {user && (
              <Link
                to="/generate"
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-all duration-200 hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Generate Quiz</span>
              </Link>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200/50">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-full transition-all duration-200 font-medium hover:bg-blue-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md border-t border-gray-200/50 rounded-b-xl shadow-lg">
              <Link
                to="/"
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-blue-50"
                onClick={closeMenu}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              
              {user && (
                <Link
                  to="/generate"
                  className="flex items-center space-x-3 text-gray-700 hover:text-purple-600 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-purple-50"
                  onClick={closeMenu}
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Generate Quiz</span>
                </Link>
              )}
              
              {user ? (
                <div className="space-y-3 pt-3 border-t border-gray-200/50">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 text-red-600 hover:text-red-700 rounded-lg text-base font-medium transition-all duration-200 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-3 border-t border-gray-200/50">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 rounded-lg text-base font-medium transition-all duration-200 hover:bg-blue-50"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg text-base font-medium transition-all duration-200 text-center"
                    onClick={closeMenu}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;