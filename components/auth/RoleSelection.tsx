// components/auth/RoleSelection.tsx
import React from 'react';
import { UserRole } from '../../types';
import { Activity, UserIcon, Stethoscope, ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  const roles = [
    {
      role: UserRole.PATIENT,
      title: "Patient",
      description: "Accéder à mon dossier médical",
      icon: UserIcon,
      color: "blue",
      iconColor: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/50",
      hoverColor: "group-hover:bg-blue-500 group-hover:text-white"
    },
    {
      role: UserRole.DOCTOR,
      title: "Médecin",
      description: "Gestion des patients et soins",
      icon: Stethoscope,
      color: "indigo",
      iconColor: "text-indigo-500 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/50",
      hoverColor: "group-hover:bg-indigo-500 group-hover:text-white"
    },
    {
      role: UserRole.LAB,
      title: "Laboratoire",
      description: "Traitement des analyses",
      icon: ShieldCheck,
      color: "emerald",
      iconColor: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/50",
      hoverColor: "group-hover:bg-emerald-500 group-hover:text-white"
    },
    {
      role: UserRole.ADMIN,
      title: "Admin",
      description: "Administration Système",
      icon: ShieldAlert,
      color: "purple",
      iconColor: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/50",
      hoverColor: "group-hover:bg-purple-500 group-hover:text-white"
    }
  ];

  return (
    <div className="w-full max-w-md z-10">
      {/* HEADER LOGO */}
      <div className="text-center mb-6 animate-fade-in-up">
        <div className="bg-white dark:bg-slate-800 p-3 w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-3 border border-blue-50 dark:border-blue-900">
          <Activity className="text-primary dark:text-blue-400" size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">TOHPITOH</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Dossier Électronique du Patient</p>
      </div>

      <div className="space-y-3 animate-fade-in">
        <p className="text-center text-slate-600 dark:text-slate-300 mb-4 font-medium">
          Veuillez sélectionner votre espace :
        </p>
        
        {roles.map(({ role, title, description, icon: Icon, iconColor, bgColor, hoverColor }) => (
          <button
            key={role}
            onClick={() => onSelectRole(role)}
            className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full ${bgColor} ${iconColor} flex items-center justify-center ${hoverColor} transition-colors`}>
                <Icon size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{description}</p>
              </div>
            </div>
            <ArrowRight className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" size={18} />
          </button>
        ))}
      </div>
    </div>
  );
};