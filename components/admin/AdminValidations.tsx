// components/admin/AdminValidations.tsx
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  Building2, 
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { api } from '../../services/api';

interface ValidationRequest {
  id: number;
  user_id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    created_at: string;
  };
  type: 'doctor' | 'laboratory';
  status: 'pending' | 'approved' | 'rejected';
  submitted_data: {
    specialization?: string;
    license_number?: string;
    hospital_affiliation?: string;
    lab_name?: string;
    address?: string;
    accreditation_number?: string;
  };
  submitted_at: string;
  reviewed_by?: number;
  reviewed_at?: string;
  rejection_reason?: string;
}

interface AdminValidationsProps {
  token: string;
  onRefresh?: () => void;
}

export const AdminValidations: React.FC<AdminValidationsProps> = ({ 
  token, 
  onRefresh 
}) => {
  const [validationRequests, setValidationRequests] = useState<ValidationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [selectedRequest, setSelectedRequest] = useState<ValidationRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Load validation requests
  const loadValidationRequests = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // In a real app, you'd have: await api.admin.getPendingValidations(token);
      // For now, simulate data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: ValidationRequest[] = [
        {
          id: 1,
          user_id: 101,
          user: {
            id: 101,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            created_at: '2024-01-15'
          },
          type: 'doctor',
          status: 'pending',
          submitted_data: {
            specialization: 'Cardiology',
            license_number: 'MED-12345',
            hospital_affiliation: 'General Hospital'
          },
          submitted_at: '2024-12-10T10:30:00Z'
        },
        {
          id: 2,
          user_id: 102,
          user: {
            id: 102,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1234567891',
            created_at: '2024-01-20'
          },
          type: 'doctor',
          status: 'pending',
          submitted_data: {
            specialization: 'Pediatrics',
            license_number: 'MED-12346',
            hospital_affiliation: 'Children\'s Hospital'
          },
          submitted_at: '2024-12-11T14:20:00Z'
        },
        {
          id: 3,
          user_id: 201,
          user: {
            id: 201,
            first_name: 'Robert',
            last_name: 'Johnson',
            email: 'robert@lab.com',
            phone: '+1234567892',
            created_at: '2024-01-25'
          },
          type: 'laboratory',
          status: 'pending',
          submitted_data: {
            lab_name: 'Central Medical Laboratory',
            address: '123 Main St, City, State 12345',
            accreditation_number: 'LAB-98765'
          },
          submitted_at: '2024-12-12T09:15:00Z'
        }
      ];
      
      setValidationRequests(mockData);
    } catch (err: any) {
      console.error('Error loading validation requests:', err);
      setError(err.message || 'Failed to load validation requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadValidationRequests();
  }, [token]);

  // Filter requests
  const filteredRequests = validationRequests.filter(request => {
    const matchesSearch = 
      request.user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.user.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (request.submitted_data.specialization?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (request.submitted_data.lab_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || request.type === filterType;
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle approve request
  const handleApproveRequest = async () => {
    if (!token || !selectedRequest) {
      setError('Authentication required or no request selected');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      if (selectedRequest.type === 'doctor') {
        await api.admin.approveDoctor(token, selectedRequest.user_id);
      } else {
        await api.admin.approveLaboratory(token, selectedRequest.user_id);
      }
      
      setSuccess(`${selectedRequest.type === 'doctor' ? 'Doctor' : 'Laboratory'} approved successfully!`);
      setShowApproveModal(false);
      setSelectedRequest(null);
      
      // Refresh data
      await loadValidationRequests();
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      setError(err.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  // Handle reject request
  const handleRejectRequest = async () => {
    if (!token || !selectedRequest) {
      setError('Authentication required or no request selected');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      if (selectedRequest.type === 'doctor') {
        await api.admin.rejectDoctor(token, selectedRequest.user_id, rejectionReason);
      } else {
        await api.admin.rejectLaboratory(token, selectedRequest.user_id, rejectionReason);
      }
      
      setSuccess(`${selectedRequest.type === 'doctor' ? 'Doctor' : 'Laboratory'} rejected successfully!`);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      
      // Refresh data
      await loadValidationRequests();
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && validationRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary dark:text-blue-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Professional Validations
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Review and validate doctor/laboratory registrations
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, specialization, or lab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="doctor">Doctors</option>
            <option value="laboratory">Laboratories</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="hover:text-red-800 dark:hover:text-red-300">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check size={20} />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="hover:text-green-800 dark:hover:text-green-300">
            ×
          </button>
        </div>
      )}

      {/* Validation Requests Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
            <p className="text-slate-500 dark:text-slate-400">No validation requests found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              All pending validations have been processed
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Applicant</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Submitted Data</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Submitted Date</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredRequests.map(request => (
                  <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {request.user.first_name} {request.user.last_name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {request.user.email}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {request.user.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                        request.type === 'doctor' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400'
                      }`}>
                        {request.type === 'doctor' ? (
                          <>
                            <User className="w-3 h-3" />
                            <span>Doctor</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3" />
                            <span>Laboratory</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {request.type === 'doctor' ? (
                          <>
                            <p className="font-medium text-slate-800 dark:text-white">
                              {request.submitted_data.specialization}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">
                              License: {request.submitted_data.license_number}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">
                              {request.submitted_data.hospital_affiliation}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-slate-800 dark:text-white">
                              {request.submitted_data.lab_name}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">
                              Accr: {request.submitted_data.accreditation_number}
                            </p>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(request.submitted_at)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowApproveModal(true);
                              }}
                              className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-400 hover:text-green-600"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 hover:text-red-600"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Validation Request Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium text-slate-600 dark:text-slate-300 mb-3">
                  Applicant Information
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {selectedRequest.user.first_name} {selectedRequest.user.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {selectedRequest.user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {selectedRequest.user.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Account Created</p>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {formatDate(selectedRequest.user.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-600 dark:text-slate-300 mb-3">
                  Professional Information
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                  {selectedRequest.type === 'doctor' ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Specialization</p>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {selectedRequest.submitted_data.specialization}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Medical License Number</p>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {selectedRequest.submitted_data.license_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Hospital/Clinic Affiliation</p>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {selectedRequest.submitted_data.hospital_affiliation}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Laboratory Name</p>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {selectedRequest.submitted_data.lab_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Accreditation Number</p>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {selectedRequest.submitted_data.accreditation_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {selectedRequest.submitted_data.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-600 dark:text-slate-300 mb-3">
                  Submission Details
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Submitted At</p>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {formatDate(selectedRequest.submitted_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedRequest.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                          : selectedRequest.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                      }`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                Close
              </button>
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowApproveModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Confirm Approval
                </h3>
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">
                    Approve {selectedRequest.type === 'doctor' ? 'Doctor' : 'Laboratory'}?
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    This will grant {selectedRequest.user.first_name} {selectedRequest.user.last_name} full access as a {selectedRequest.type}.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleApproveRequest}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  'Confirm Approval'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Reject Application
                </h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <XCircle className="w-12 h-12 text-red-500" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">
                    Reject {selectedRequest.type === 'doctor' ? 'Doctor' : 'Laboratory'}?
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Please provide a reason for rejection.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[100px]"
                  placeholder="Provide a clear reason for rejection..."
                  required
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectRequest}
                disabled={loading || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};