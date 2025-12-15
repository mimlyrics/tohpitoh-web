// components/admin/AdminUsersList.tsx
import React, { useState } from 'react';
import { User } from '../../types';
import { UserIcon, Mail, Phone, CheckCircle, XCircle, MoreVertical, Search, Filter } from 'lucide-react';

interface AdminUsersListProps {
  users: User[];
  onUserAction: (userId: number, action: 'activate' | 'deactivate' | 'delete') => void;
}

export const AdminUsersList: React.FC<AdminUsersListProps> = ({ users, onUserAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActions, setShowActions] = useState<number | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && user.is_active) ||
                         (filter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesFilter;
  });

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400';
      case 'doctor': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-400';
      case 'laboratory': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400';
      case 'patient': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active' 
                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'inactive' 
                ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
            <p className="text-slate-500 dark:text-slate-400">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <UserIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        )}
                      </div>
                      {user.is_active && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-white">
                        {user.first_name} {user.last_name}
                      </h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >.
                      <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                    
                    {showActions === user.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                        <div className="py-1">
                          {user.is_active ? (
                            <button
                              onClick={() => {
                                onUserAction(user.id, 'deactivate');
                                setShowActions(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                onUserAction(user.id, 'activate');
                                setShowActions(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50 flex items-center"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onUserAction(user.id, 'delete');
                              setShowActions(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};