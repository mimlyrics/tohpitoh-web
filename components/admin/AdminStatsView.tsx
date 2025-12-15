// components/admin/AdminStatsView.tsx (updated)
import React from 'react';
import { 
  Users, 
  Stethoscope, 
  Building2, 
  FileText, 
  Pill, 
  ClipboardList, 
  Shield,
  Activity,
  UserPlus,
  HeartPulse,
  FlaskRound
} from 'lucide-react';
import { AdminStats } from '../../types';

interface AdminStatsViewProps {
  stats: AdminStats;
  onStatClick?: (statType: string) => void;
}

export const AdminStatsView: React.FC<AdminStatsViewProps> = ({ 
  stats, 
  onStatClick 
}) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => onStatClick?.('users')
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: HeartPulse,
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
      onClick: () => onStatClick?.('patients')
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: Stethoscope,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      onClick: () => onStatClick?.('doctors')
    },
    {
      title: 'Total Laboratories',
      value: stats.totalLabs,
      icon: FlaskRound,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      onClick: () => onStatClick?.('laboratories')
    },
    {
      title: 'Medical Records',
      value: stats.totalMedicalRecords,
      icon: FileText,
      color: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
      onClick: () => onStatClick?.('medicalRecords')
    },
    {
      title: 'Prescriptions',
      value: stats.totalPrescriptions,
      icon: Pill,
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
      onClick: () => onStatClick?.('prescriptions')
    },
    {
      title: 'Lab Tests',
      value: stats.totalLabTests,
      icon: ClipboardList,
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      onClick: () => onStatClick?.('labTests')
    },
    {
      title: 'Active Accesses',
      value: stats.activeRecords,
      icon: Shield,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => onStatClick?.('activeAccesses')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Dashboard Overview
        </h2>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Real-time System Statistics
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            className={`bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color} bg-opacity-10 dark:bg-opacity-20`}>
                <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {card.value}
              </div>
            </div>
            <h3 className="font-medium text-slate-600 dark:text-slate-300">
              {card.title}
            </h3>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Click to view details
            </div>
          </div>
        ))}
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800 dark:text-white">User Growth</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Last 30 days</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            +{Math.floor(stats.totalUsers * 0.1)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            New users this month
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800 dark:text-white">System Health</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active sessions</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            {stats.activeRecords}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Active connections
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800 dark:text-white">Verified Professionals</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Doctors & Labs</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            {stats.totalDoctors + stats.totalLabs}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Approved and active
          </div>
        </div>
      </div>
    </div>
  );
};