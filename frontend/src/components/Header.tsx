import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Bookmark, Phone, Menu, X, Sparkles, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header 
      className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white shadow-2xl relative overflow-hidden"
      role="banner" 
      aria-label="AI Job Accessibility header"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Top Utility Bar */}
      <div className="bg-black/20 border-b border-white/10 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <button 
                className="flex items-center space-x-1 sm:space-x-2 hover:text-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-2 py-1 hover:bg-white/10"
                aria-label="Language selector"
              >
                <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">EN</span>
              </button>
              <button 
                className="flex items-center space-x-1 sm:space-x-2 hover:text-purple-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-lg px-2 py-1 hover:bg-white/10"
                aria-label="Saved items"
              >
                <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Saved</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                className="flex items-center space-x-1 sm:space-x-2 text-pink-300 hover:text-pink-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-lg px-2 py-1 hover:bg-white/10"
                aria-label="Emergency contacts"
              >
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Emergency: 112</span>
                <span className="sm:hidden">112</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center space-x-2 sm:space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <Sparkles className="text-lg sm:text-xl lg:text-2xl text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-lg">
                WorkAble
              </h1>
              <p className="text-blue-200 text-xs sm:text-sm hidden sm:block drop-shadow-sm">
                
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav 
            className="hidden lg:flex items-center space-x-6"
            aria-label="Main navigation"
          >
            <Link 
              to="/" 
              className="text-white hover:text-blue-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-3 py-2 hover:bg-white/10 relative group"
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-white hover:text-indigo-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-lg px-3 py-2 hover:bg-white/10 relative group"
                >
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <Link 
                  to="/resume-builder" 
                  className="text-white hover:text-pink-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-lg px-3 py-2 hover:bg-white/10 relative group"
                >
                  <span className="relative z-10">Resume Builder</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <Link 
                  to="/job-recommendations" 
                  className="text-white hover:text-yellow-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg px-3 py-2 hover:bg-white/10 relative group"
                >
                  <span className="relative z-10">Jobs</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <Link 
                  to="/profile" 
                  className="text-white hover:text-cyan-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg px-3 py-2 hover:bg-white/10 relative group flex items-center space-x-1"
                >
                  <User className="w-4 h-4" />
                  <span className="relative z-10">Profile</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/job-recommendations" 
                  className="text-white hover:text-yellow-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg px-3 py-2 hover:bg-white/10 relative group"
                >
                  <span className="relative z-10">Jobs</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <Link 
                  to="/contact" 
                  className="text-white hover:text-cyan-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg px-3 py-2 hover:bg-white/10 relative group"
                >
                  <span className="relative z-10">Contact</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="outline"
                    className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                    size="sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                    size="sm"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile CTA Button */}
          {!isAuthenticated && (
            <div className="hidden lg:block">
              <Link to="/register">
                <Button 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                  size="lg"
                >
                  Get Started ✨
                </Button>
              </Link>
            </div>
          )}
          
          {isAuthenticated && user && (
            <div className="hidden lg:flex items-center space-x-3">
              <span className="text-white text-sm">Hello, {user.name}</span>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-white hover:text-blue-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div 
          className="lg:hidden bg-black/30 backdrop-blur-md border-t border-white/10 relative z-10"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 py-6 space-y-4">
            <Link 
              to="/" 
              className="block text-white hover:text-blue-300 transition-all duration-200 font-medium py-3 px-4 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              🏠 Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block text-white hover:text-indigo-300 transition-all duration-200 font-medium py-3 px-4 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📊 Dashboard
                </Link>
                <Link 
                  to="/resume-builder" 
                  className="block text-white hover:text-pink-300 transition-all duration-200 font-medium py-3 px-4 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📝 Resume Builder
                </Link>
                <Link 
                  to="/job-recommendations" 
                  className="block text-white hover:text-yellow-300 transition-all duration-200 font-medium py-3 px-4 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  💼 Jobs
                </Link>
                <Link 
                  to="/profile" 
                  className="block text-white hover:text-cyan-300 transition-all duration-200 font-medium py-3 px-4 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  👤 Profile
                </Link>
                <div className="pt-4 border-t border-white/20">
                  {user && (
                    <p className="text-white text-sm mb-3 px-4">Hello, {user.name}</p>
                  )}
                  <Button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/job-recommendations" 
                  className="block text-white hover:text-yellow-300 transition-all duration-200 font-medium py-3 px-4 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  💼 Jobs
                </Link>
                <Link 
                  to="/contact" 
                  className="block text-white hover:text-cyan-300 transition-all duration-200 font-medium py-3 px-4 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📞 Contact
                </Link>
                <div className="pt-4 border-t border-white/20 space-y-3">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="outline"
                      className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                      size="lg"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                      size="lg"
                    >
                      Get Started ✨
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
