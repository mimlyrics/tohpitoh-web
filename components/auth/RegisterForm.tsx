// components/auth/RegisterForm.tsx (simplified)
import React, { useState } from 'react';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, Mail, Lock, Phone, Globe, Loader2 } from 'lucide-react';

interface RegisterFormProps {
  targetRole: UserRole;
  error: string;
  successMsg: string;
  onBack: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  targetRole,
  error,
  successMsg,
  onBack
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    country: ''
  });

  const { register, loading } = useAuth();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData, targetRole);
      // After successful registration, user will be auto-logged in
      // and redirected to profile completion
    } catch (err) {
      // Error is already handled in auth context
    }
  };

  const getButtonColor = () => {
    switch (targetRole) {
      case UserRole.PATIENT: return 'bg-primary hover:bg-sky-600';
      case UserRole.DOCTOR: return 'bg-secondary hover:bg-indigo-600';
      case UserRole.LAB: return 'bg-accent hover:bg-emerald-600';
      default: return 'bg-primary hover:bg-sky-600';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 animate-slide-in relative border border-slate-50 dark:border-slate-700">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
      >
        .<ChevronLeft size={24} />
      </button>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Create Account
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Step 1: Basic information
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs text-center border border-red-100 dark:border-red-900/50 font-medium mb-4">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-xs text-center border border-green-100 dark:border-green-900/50 font-medium mb-4">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              First Name
            </label>
            <input 
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Last Name
            </label>
            <input 
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="+1234567890"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Country (Optional)
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Your country"
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center p-4 rounded-xl font-bold text-white transition transform active:scale-95 shadow-lg disabled:opacity-70 disabled:scale-100 ${getButtonColor()}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
          
          <div className="text-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              By creating an account, you agree to our Terms and Privacy Policy
            </p>
            <button 
              type="button"
              onClick={onBack}
              className="mt-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};