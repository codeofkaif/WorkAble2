import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Briefcase,
  FileText,
  Users,
  GraduationCap,
  MessageSquare,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const quickLinks = [
    {
      title: 'Resume Builder',
      description: 'Create professional resumes with AI assistance',
      icon: FileText,
      href: '/resume-builder',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Job Recommendations',
      description: 'AI-powered job matching for your profile',
      icon: Briefcase,
      href: '/job-recommendations',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Service Providers',
      description: 'Find accessible employment services',
      icon: Users,
      href: '/providers',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Training Resources',
      description: 'Skill development and certification',
      icon: GraduationCap,
      href: '/training',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: 'Interview Prep',
      description: 'AI-powered interview assistance',
      icon: MessageSquare,
      href: '/interview',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const features = [
    {
      title: 'AI-Powered Resume Building',
      description: 'Create professional, ATS-friendly resumes with intelligent suggestions',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Accessibility-First Design',
      description: 'Built with WCAG 2.1 AA compliance and assistive technology support',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Voice & Keyboard Navigation',
      description: 'Multiple input methods for enhanced accessibility and convenience',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'Government-Grade Security',
      description: 'Enterprise-level security with SOC 2 compliance and data protection',
      icon: CheckCircle,
      color: 'text-purple-600'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 🔹 API INTEGRATION (keep existing backend call)
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="h-[750px] relative overflow-hidden bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Empowering Inclusive
              <span className="block text-magenta-400">Employment</span>
            </h1>
            <p className="text-xl md:text-2xl text-navy-200 mb-8 max-w-4xl mx-auto leading-relaxed">
              AI-powered job accessibility platform designed specifically for disabled persons. 
              Break barriers, unlock opportunities, and build your career with confidence.
            </p>
            
            {/* Global Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search for jobs, services, or resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 shadow-2xl focus:ring-2 focus:ring-magenta-400 text-gray-900"
                  aria-label="Global search for jobs, services, or resources"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-magenta-500 to-magenta-600 hover:from-magenta-600 hover:to-magenta-700 text-white px-6 py-2 rounded-xl shadow-lg"
                  aria-label="Submit search"
                >
                  Search
                </Button>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-magenta-500 to-magenta-600 hover:from-magenta-600 hover:to-magenta-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={() => window.location.href = '/resume-builder'}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-navy-900 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300"
                onClick={() => window.location.href = '/providers'}
              >
                Find Services
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and resources designed to support your career journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-lg hover:-translate-y-1"
                  onClick={() => window.location.href = link.href}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${link.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <link.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 group-hover:text-navy-600 transition-colors">
                      {link.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 mb-4">
                      {link.description}
                    </CardDescription>
                    <Button 
                      variant="outline" 
                      className="group-hover:bg-navy-600 group-hover:text-white group-hover:border-navy-600 transition-all duration-300"
                    >
                      Explore
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose AI Job Accessibility?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with accessibility at its core, our platform ensures everyone can access employment opportunities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-navy-600 to-magenta-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-navy-100 mb-8">
              Join thousands of disabled professionals who have found success through our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-navy-900 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold shadow-xl"
                onClick={() => window.location.href = '/resume-builder'}
              >
                Build Your Resume
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-navy-900 px-8 py-4 rounded-xl text-lg font-semibold"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
