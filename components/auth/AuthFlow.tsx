// components/auth/AuthFlow.tsx
import React, { useState } from 'react';
import { UserRole } from '../../types';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '../../contexts/AuthContext';
import { RoleSelection } from './RoleSelection';

export const AuthFlow: React.FC = () => {
  const [authStep, setAuthStep] = useState<'role-selection' | 'login' | 'register'>('role-selection');
  const [targetRole, setTargetRole] = useState<UserRole | null>(null);
  const { error, successMsg, clearError, clearSuccess } = useAuth();

  const selectRole = (role: UserRole) => {
    setTargetRole(role);
    setAuthStep('login');
    clearError();
    clearSuccess();
  };

  const goToRoleSelection = () => {
    setAuthStep('role-selection');
    setTargetRole(null);
    clearError();
    clearSuccess();
  };

  const goToRegister = () => {
    setAuthStep('register');
    clearError();
    clearSuccess();
  };

  const goToLogin = () => {
    setAuthStep('login');
    clearError();
    clearSuccess();
  };

  if (authStep === 'role-selection') {
    return <RoleSelection onSelectRole={selectRole} />;
  }

  if (!targetRole) return null;

  if (authStep === 'login') {
    return (
      <LoginForm
        targetRole={targetRole}
        error={error}
        successMsg={successMsg}
        onBack={goToRoleSelection}
        onGoToRegister={goToRegister}
      />
    );
  }

  return (
    <RegisterForm
      targetRole={targetRole}
      error={error}
      successMsg={successMsg}
      onBack={goToLogin}
    />
  );
};