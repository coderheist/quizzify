import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuizGeneratorPage from './pages/QuizGeneratorPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/generate" 
              element={
                <ProtectedRoute>
                  <QuizGeneratorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz/:id" 
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/result" 
              element={
                <ProtectedRoute>
                  <ResultPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;