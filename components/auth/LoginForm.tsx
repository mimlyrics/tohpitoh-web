// components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, Mail, Lock, Loader2 } from 'lucide-react';

interface LoginFormProps {
  targetRole: UserRole;
  error: string;
  successMsg: string;
  onBack: () => void;
  onGoToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  targetRole,
  error,
  successMsg,
  onBack,
  onGoToRegister
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, targetRole);
    } catch (err) {
      // Error is already handled in auth context
    }
  };

  const getRoleColor = () => {
    switch (targetRole) {
      case UserRole.PATIENT: return 'text-primary dark:text-blue-400';
      case UserRole.DOCTOR: return 'text-secondary dark:text-indigo-400';
      case UserRole.LAB: return 'text-accent dark:text-emerald-400';
      case UserRole.ADMIN: return 'text-purple-600 dark:text-purple-400';
      default: return 'text-primary';
    }
  };

  const getButtonColor = () => {
    switch (targetRole) {
      case UserRole.PATIENT: return 'bg-primary hover:bg-sky-600';
      case UserRole.DOCTOR: return 'bg-secondary hover:bg-indigo-600';
      case UserRole.LAB: return 'bg-accent hover:bg-emerald-600';
      case UserRole.ADMIN: return 'bg-purple-600 hover:bg-purple-700';
      default: return 'bg-primary hover:bg-sky-600';
    }
  };

  const getRoleTitle = () => {
    switch (targetRole) {
      case UserRole.PATIENT: return 'Espace Patient';
      case UserRole.DOCTOR: return 'Espace Médecin';
      case UserRole.LAB: return 'Espace Laboratoire';
      case UserRole.ADMIN: return 'Espace Admin';
      default: return '';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 animate-slide-in relative border border-slate-50 dark:border-slate-700">
      
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
      >.
        <ChevronLeft size={24} />
      </button>

      <div className="text-center mb-6">
        <h2 className={`text-xl font-bold ${getRoleColor()}`}>
          {getRoleTitle()}
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Connexion à votre compte
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
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder="exemple@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center p-4 rounded-xl font-bold text-white transition transform active:scale-95 shadow-lg disabled:opacity-70 disabled:scale-100 ${getButtonColor()}`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Se Connecter"}
          </button>
        </div>
        
        {targetRole !== UserRole.ADMIN && (
          <div className="text-center mt-4 border-t border-slate-100 dark:border-slate-700 pt-4">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Nouveau sur TOHPITOH ?
            </p>
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-sm font-bold text-primary dark:text-blue-400 hover:underline mt-1"
            >
              Créer un compte
            </button>
          </div>
        )}
      </form>
    </div>
  );
};