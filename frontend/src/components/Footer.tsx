import React from 'react';

import { 
  Accessibility, 
  Shield, 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-magenta-500 to-magenta-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">🧩</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Job Accessibility</h3>
                <p className="text-navy-200 text-sm">Empowering Inclusive Employment</p>
              </div>
            </div>
            <p className="text-navy-200 text-sm leading-relaxed mb-4">
              Breaking barriers and creating opportunities for disabled persons through AI-powered job accessibility solutions.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" className="text-navy-200 border-navy-600 hover:bg-navy-700">
                <Accessibility className="w-4 h-4 mr-2" />
                Accessibility
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/" 
                  className="text-navy-200 hover:text-magenta-300 transition-colors flex items-center group"
                  aria-label="Go to home page"
                >
                  <span className="w-2 h-2 bg-magenta-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="/providers" 
                  className="text-navy-200 hover:text-magenta-300 transition-colors flex items-center group"
                  aria-label="Browse service providers"
                >
                  <span className="w-2 h-2 bg-magenta-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Service Providers
                </a>
              </li>
              <li>
                <a 
                  href="/resume-builder" 
                  className="text-navy-200 hover:text-magenta-300 transition-colors flex items-center group"
                  aria-label="Build your resume"
                >
                  <span className="w-2 h-2 bg-magenta-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Resume Builder
                </a>
              </li>
              <li>
                <a 
                  href="/dashboard" 
                  className="text-navy-200 hover:text-magenta-300 transition-colors flex items-center group"
                  aria-label="Access your dashboard"
                >
                  <span className="w-2 h-2 bg-magenta-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Support & Resources</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/training" 
                  className="text-navy-200 hover:text-magenta-300 transition-colors flex items-center group"
                  aria-label="Access training resources"
                >
                  <span className="w-2 h-2 bg-magenta-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Training Resources
                </a>
              </li>
              <li>
                <a 
                  href="/assistive-tools" 
                  className="text-navy-200 hover:text-magenta-300 transition-colors flex items-center group"
                  aria-label="Explore assistive tools"
                >
                  <span className="w-2 h-2 bg-magenta-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Assistive Tools
                </a>
              </li>
              <li>
                <a 
                  href="/stories" 
                  className="text-navy-200 hover:text-magenta-300 transition-colors flex items-center group"
                  aria-label="Read success stories"
                >
                  <span className="w-2 h-2 bg-magenta-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Success Stories
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-navy-200 hover:text-magenta-300 transition-colors flex items-center group"
                  aria-label="Contact support"
                >
                  <span className="w-2 h-2 bg-magenta-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact & Legal</h4>
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-navy-200 text-sm">
                <Mail className="w-4 h-4 mr-2 text-magenta-400" />
                <span>workable02@gmail.com</span>
              </div>
              <div className="flex items-center text-navy-200 text-sm">
                <Phone className="w-4 h-4 mr-2 text-magenta-400" />
                <span>+91 6388913772</span>
              </div>
              <div className="flex items-center text-navy-200 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-magenta-400" />
                <span>Lucknow, UP</span>
              </div>
            </div>
            <div className="space-y-2">
              <Button 
                variant="magenta" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = '/contact'}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Talk to Us
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-navy-300">
              <a 
                href="/accessibility" 
                className="hover:text-magenta-300 transition-colors flex items-center"
                aria-label="Accessibility statement"
              >
                <Accessibility className="w-4 h-4 mr-1" />
                Accessibility
              </a>
              <a 
                href="/disclaimer" 
                className="hover:text-magenta-300 transition-colors"
                aria-label="Legal disclaimer"
              >
                Disclaimer
              </a>
              <a 
                href="/privacy" 
                className="hover:text-magenta-300 transition-colors flex items-center"
                aria-label="Privacy policy"
              >
                <Shield className="w-4 h-4 mr-1" />
                Privacy
              </a>
              <a 
                href="/feedback" 
                className="hover:text-magenta-300 transition-colors flex items-center"
                aria-label="Provide feedback"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Feedback
              </a>
            </div>
            
            <div className="flex items-center space-x-4">
              <p className="text-sm text-navy-300">
                Made with <Heart className="w-4 h-4 inline text-magenta-400" /> for accessibility
              </p>
              <a 
                href="https://www.linkedin.com/company/ai-job-accessibility" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-navy-300 hover:text-magenta-300 transition-colors flex items-center"
                aria-label="Visit our LinkedIn page (opens in new tab)"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-navy-400">
              © {currentYear} AI Job Accessibility. All rights reserved. | 
              <span className="ml-1">Empowering inclusive employment through AI innovation</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
