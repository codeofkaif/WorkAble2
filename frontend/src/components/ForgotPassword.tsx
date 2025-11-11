import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, AlertCircle, Mail, Phone, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

type Step = 'email' | 'otp' | 'password';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [usePhone, setUsePhone] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = usePhone ? { phone } : { email };
      const response = await api.post('/auth/forgot-password', payload);

      if (response.data.status === 'success') {
        setOtpSent(true);
        setCountdown(60); // 60 seconds cooldown
        setStep('otp');
        // In development, show OTP in console
        if (response.data.otp) {
          console.log('OTP (Development only):', response.data.otp);
          alert(`OTP sent! Check console for OTP (Development mode): ${response.data.otp}`);
        }
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = usePhone ? { phone, otp } : { email, otp };
      const response = await api.post('/auth/verify-otp', payload);

      if (response.data.status === 'success') {
        setResetToken(response.data.resetToken);
        setStep('password');
      } else {
        throw new Error(response.data.message || 'Invalid OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        resetToken,
        newPassword
      });

      if (response.data.status === 'success') {
        // Show success message and redirect to login
        alert('Password reset successfully! You can now login with your new password.');
        navigate('/login');
      } else {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);

    try {
      const payload = usePhone ? { phone } : { email };
      const response = await api.post('/auth/forgot-password', payload);

      if (response.data.status === 'success') {
        setCountdown(60);
        if (response.data.otp) {
          console.log('OTP (Development only):', response.data.otp);
          alert(`OTP resent! Check console for OTP (Development mode): ${response.data.otp}`);
        }
      } else {
        throw new Error(response.data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Reset your password using mobile verification
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {step === 'email' && 'Enter Email or Phone'}
                  {step === 'otp' && 'Enter OTP'}
                  {step === 'password' && 'Set New Password'}
                </CardTitle>
                <CardDescription>
                  {step === 'email' && 'We will send an OTP to verify your identity'}
                  {step === 'otp' && 'Enter the 6-digit OTP sent to your mobile'}
                  {step === 'password' && 'Create a new secure password'}
                </CardDescription>
              </div>
              {step !== 'email' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep('email');
                    setError('');
                    setOtp('');
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {step === 'email' && (
                <motion.form
                  key="email"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOTP}
                  className="space-y-4"
                >
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setUsePhone(false)}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                        !usePhone
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsePhone(true)}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                        usePhone
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone
                    </button>
                  </div>

                  {!usePhone ? (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1234567890"
                          required
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Include country code (e.g., +91 for India)
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </motion.form>
              )}

              {step === 'otp' && (
                <motion.form
                  key="otp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-4"
                >
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {otpSent && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-800">
                        OTP sent to {usePhone ? phone : email}
                      </p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                      6-Digit OTP
                    </label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      required
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-mono"
                      disabled={loading}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the 6-digit code sent to your {usePhone ? 'phone' : 'email'}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={countdown > 0}
                      className={`text-sm ${
                        countdown > 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-blue-600 hover:text-blue-500'
                      }`}
                    >
                      {countdown > 0
                        ? `Resend OTP in ${countdown}s`
                        : 'Resend OTP'}
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 'password' && (
                <motion.form
                  key="password"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

