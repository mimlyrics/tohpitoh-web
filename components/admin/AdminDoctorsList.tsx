// components/admin/AdminDoctorsList.tsx
import React, { useState } from 'react';
import { Doctor } from '../../types';
import { Stethoscope, Mail, Phone, Building, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

interface AdminDoctorsListProps {
  doctors: Doctor[];
  onApproveDoctor: (doctorId: number) => void;
  onRejectDoctor: (doctorId: number, reason?: string) => void;
}

export const AdminDoctorsList: React.FC<AdminDoctorsListProps> = ({ 
  doctors, 
  onApproveDoctor, 
  onRejectDoctor 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.license_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' ||
                         (filter === 'pending' && !doctor.is_approved && !doctor.approved_at) ||
                         (filter === 'approved' && doctor.is_approved) ||
                         (filter === 'rejected' && doctor.approved_at && !doctor.is_approved);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (doctor: Doctor) => {
    if (!doctor.is_approved && !doctor.approved_at) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 rounded-full text-xs font-medium">
          Pending
        </span>
      );
    } else if (doctor.is_approved) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 rounded-full text-xs font-medium">
          Approved
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400 rounded-full text-xs font-medium">
          Rejected
        </span>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? f === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400' :
                    f === 'approved' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400' :
                    f === 'rejected' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400' :
                    'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors List */}
      <div className="space-y-3">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <Stethoscope className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
            <p className="text-slate-500 dark:text-slate-400">No doctors found</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <div 
              key={doctor.id} 
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-bold text-slate-800 dark:text-white">
                        Dr. {doctor.user?.first_name} {doctor.user?.last_name}
                      </h4>
                      {getStatusBadge(doctor)}
                    </div>
                    
                    <div className="space-y-1">
                      {doctor.specialization && (
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-medium">Specialization:</span> {doctor.specialization}
                        </p>
                      )}
                      
                      {doctor.license_number && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-medium">License:</span> {doctor.license_number}
                        </p>
                      )}
                      
                      {doctor.hospital_affiliation && (
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Building className="w-4 h-4 mr-1" />
                          {doctor.hospital_affiliation}
                        </div>
                      )}
                      
                      {doctor.user?.email && (
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Mail className="w-4 h-4 mr-1" />
                          {doctor.user.email}
                        </div>
                      )}
                      
                      {doctor.user?.phone && (
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Phone className="w-4 h-4 mr-1" />
                          {doctor.user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                {!doctor.is_approved && !doctor.approved_at && (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => onApproveDoctor(doctor.id)}
                      className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        // Open modal or show text input for rejection reason
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
              
              {/* Approval Info */}
              {doctor.approved_at && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {doctor.is_approved ? 'Approved' : 'Rejected'} on {new Date(doctor.approved_at).toLocaleDateString()}
                    {doctor.approved_by_admin_id && ` by Admin #${doctor.approved_by_admin_id}`}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Rejection Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Reject Doctor Application
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Please provide a reason for rejecting Dr. {selectedDoctor.user?.first_name}'s application:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setSelectedDoctor(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRejectDoctor(selectedDoctor.id, rejectReason);
                  setSelectedDoctor(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};