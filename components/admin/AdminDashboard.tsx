// components/admin/AdminDashboard.tsx (updated)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { AdminStats } from '../../types';
import { AdminStatsView } from './AdminStatsView';
import { AdminUsersList } from './AdminUsersList';
import { AdminDoctorsList } from './AdminDoctorsList';
import { AdminLaboratoriesList } from './AdminLaboratoriesList';
import { AdminPatientsList } from './AdminPatientsList';
import { AdminMedicalRecordsList } from './AdminMedicalRecordsList';
import { AdminPrescriptionsList } from './AdminPrescriptionsList';
import { AdminLabTestsList } from './AdminLabTestsList';
import { AdminValidations } from './AdminValidations';
import { AdminAccessRequests } from './AdminAccessRequests';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface AdminDashboardProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  activeTab,
  onTabChange 
}) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Handle stat card clicks
  const handleStatClick = (statType: string) => {
    switch (statType) {
      case 'users':
      case 'totalUsers':
        onTabChange?.('users');
        navigate('/admin/users');
        break;
      case 'patients':
      case 'totalPatients':
        onTabChange?.('patients');
        navigate('/admin/patients');
        break;
      case 'doctors':
      case 'totalDoctors':
        onTabChange?.('doctors');
        navigate('/admin/doctors');
        break;
      case 'laboratories':
      case 'totalLaboratories':
        onTabChange?.('laboratories');
        navigate('/admin/laboratories');
        break;
      case 'medicalRecords':
      case 'totalMedicalRecords':
        onTabChange?.('medical-records');
        navigate('/admin/medical-records');
        break;
      case 'prescriptions':
      case 'totalPrescriptions':
        onTabChange?.('prescriptions');
        navigate('/admin/prescriptions');
        break;
      case 'labTests':
      case 'totalLabTests':
        onTabChange?.('lab-tests');
        navigate('/admin/lab-tests');
        break;
      case 'activeAccesses':
      case 'totalActiveAccesses':
        onTabChange?.('access');
        navigate('/admin/access');
        break;
    }
  };

  const loadDataForTab = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      switch (activeTab) {
        case 'dashboard':
          try {
            const statsData = await api.admin.getDashboardStats(token);
            setStats(statsData);
            console.log('Dashboard stats loaded:', statsData);
          } catch (statsErr) {
            console.warn('Could not load dashboard stats:', statsErr);
            setError('Failed to load dashboard statistics');
          }
          break;
          
        case 'users':
          try {
            const usersData = await api.admin.getAllUsers(token);
            setUsers(usersData);
          } catch (usersErr) {
            setError('Failed to load users: ' + (usersErr as Error).message);
            setUsers([]);
          }
          break;
          
        case 'patients':
          try {
            const patientsData = await api.admin.getAllPatients(token);
            setPatients(patientsData);
          } catch (patientsErr) {
            setError('Failed to load patients: ' + (patientsErr as Error).message);
            setPatients([]);
          }
          break;
          
        case 'doctors':
          try {
            const doctorsData = await api.admin.getAllDoctors(token);
            setDoctors(doctorsData);
          } catch (doctorsErr) {
            setError('Failed to load doctors: ' + (doctorsErr as Error).message);
            setDoctors([]);
          }
          break;
          
        case 'laboratories':
          try {
            const labsData = await api.admin.getAllLaboratories(token);
            setLaboratories(labsData);
          } catch (labsErr) {
            setError('Failed to load laboratories: ' + (labsErr as Error).message);
            setLaboratories([]);
          }
          break;
          
        case 'medical-records':
          try {
            const recordsData = await api.admin.getAllMedicalRecords(token);
            setMedicalRecords(recordsData);
          } catch (recordsErr) {
            setError('Failed to load medical records: ' + (recordsErr as Error).message);
            setMedicalRecords([]);
          }
          break;
          
        case 'prescriptions':
          try {
            const prescriptionsData = await api.admin.getAllPrescriptions(token);
            setPrescriptions(prescriptionsData);
          } catch (prescriptionsErr) {
            setError('Failed to load prescriptions: ' + (prescriptionsErr as Error).message);
            setPrescriptions([]);
          }
          break;
          
        case 'lab-tests':
          try {
            const testsData = await api.admin.getAllLabTests(token);
            setLabTests(testsData);
          } catch (testsErr) {
            setError('Failed to load lab tests: ' + (testsErr as Error).message);
            setLabTests([]);
          }
          break;
          
        case 'validations':
          try {
            // Load pending validations for doctors and labs
            const pendingDoctors = await api.admin.getAllDoctors(token);
            const pendingLabs = await api.admin.getAllLaboratories(token);
            
            // Filter for pending approval
            const pendingValidations = [
              ...pendingDoctors.filter((doc: any) => doc.status === 'pending'),
              ...pendingLabs.filter((lab: any) => lab.status === 'pending')
            ];
            
            // You might want to set this to a state variable
            console.log('Pending validations:', pendingValidations);
          } catch (validationsErr) {
            console.warn('Could not load validations:', validationsErr);
          }
          break;
          
        case 'access':
          try {
            const requestsData = await api.admin.getAccessRequests(token);
            setAccessRequests(requestsData);
          } catch (requestsErr) {
            console.warn('Could not load access requests:', requestsErr);
            setAccessRequests([]);
          }
          break;
      }
    } catch (err: any) {
      console.error('Error in admin dashboard:', err);
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataForTab();
  }, [token, activeTab]);

  // Action handlers
  const handleApproveDoctor = async (doctorId: number) => {
    if (!token) {
      setError('Authentication required');
      return;
    }
    
    setLoading(true);
    try {
      await api.admin.approveDoctor(token, doctorId);
      await loadDataForTab();
    } catch (err: any) {
      setError(err.message || 'Failed to approve doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDoctor = async (doctorId: number, reason?: string) => {
    if (!token) {
      setError('Authentication required');
      return;
    }
    
    setLoading(true);
    try {
      await api.admin.rejectDoctor(token, doctorId, reason);
      await loadDataForTab();
    } catch (err: any) {
      setError(err.message || 'Failed to reject doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLaboratory = async (labId: number) => {
    if (!token) {
      setError('Authentication required');
      return;
    }
    
    setLoading(true);
    try {
      await api.admin.approveLaboratory(token, labId);
      await loadDataForTab();
    } catch (err: any) {
      setError(err.message || 'Failed to approve laboratory');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLaboratory = async (labId: number, reason?: string) => {
    if (!token) {
      setError('Authentication required');
      return;
    }
    
    setLoading(true);
    try {
      await api.admin.rejectLaboratory(token, labId, reason);
      await loadDataForTab();
    } catch (err: any) {
      setError(err.message || 'Failed to reject laboratory');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: 'activate' | 'deactivate' | 'delete') => {
    if (!token) {
      setError('Authentication required');
      return;
    }
    
    setLoading(true);
    try {
      if (action === 'delete') {
        await api.admin.deleteUser(token, userId);
      } else {
        await api.admin.updateUser(token, userId, {
          is_active: action === 'activate'
        });
      }
      await loadDataForTab();
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientAction = async (patientId: number, action: 'update' | 'delete', data?: any) => {
    if (!token) {
      setError('Authentication required');
      return;
    }
    
    setLoading(true);
    try {
      if (action === 'delete') {
        await api.admin.deletePatient(token, patientId);
      } else {
        await api.admin.updatePatient(token, patientId, data);
      }
      await loadDataForTab();
    } catch (err: any) {
      setError(err.message || `Failed to ${action} patient`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError('');
    loadDataForTab();
  };

  if (loading && !error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary dark:text-blue-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">
                Error Loading Data
              </h3>
              <p className="text-red-700 dark:text-red-400 text-sm mb-4">
                {error}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
                <button
                  onClick={() => setError('')}
                  className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}
      
      {activeTab === 'dashboard' && stats && (
        <AdminStatsView 
          stats={stats} 
          onStatClick={handleStatClick}
        />
      )}
      
      {activeTab === 'users' && (
        <AdminUsersList 
          users={users} 
          onUserAction={handleUserAction}
        />
      )}
      
      {activeTab === 'patients' && (
        <AdminPatientsList 
          patients={patients}
          onPatientAction={handlePatientAction}
        />
      )}
      
      {activeTab === 'doctors' && (
        <AdminDoctorsList 
          doctors={doctors}
          onApproveDoctor={handleApproveDoctor}
          onRejectDoctor={handleRejectDoctor}
        />
      )}
      
      {activeTab === 'laboratories' && (
        <AdminLaboratoriesList 
          laboratories={laboratories}
          onApproveLaboratory={handleApproveLaboratory}
          onRejectLaboratory={handleRejectLaboratory}
        />
      )}
      
      {activeTab === 'medical-records' && (
        <AdminMedicalRecordsList 
          medicalRecords={medicalRecords}
        />
      )}
      
      {activeTab === 'prescriptions' && (
        <AdminPrescriptionsList 
          prescriptions={prescriptions}
        />
      )}
      
      {activeTab === 'lab-tests' && (
        <AdminLabTestsList 
          labTests={labTests}
        />
      )}
      
      {activeTab === 'validations' && (
        <AdminValidations 
          token={token || ''}
          onRefresh={loadDataForTab}
        />
      )}
      
      {activeTab === 'access' && (
        <AdminAccessRequests 
          requests={accessRequests}
          onRefresh={loadDataForTab}
        />
      )}
    </div>
  );
};