// components/admin/AdminPrescriptionsList.tsx
import React, { useState } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Stethoscope,
  AlertCircle,
  Check,
  X,
  Filter,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Prescription {
  id: number;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
  };
  doctor: {
    id: number;
    first_name: string;
    last_name: string;
    specialization?: string;
  };
  created_at: string;
}

interface AdminPrescriptionsListProps {
  prescriptions: Prescription[];
  token?: string;
  onRefresh?: () => void;
}

export const AdminPrescriptionsList: React.FC<AdminPrescriptionsListProps> = ({
  prescriptions: initialPrescriptions,
  token,
  onRefresh
}) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [newPrescription, setNewPrescription] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true,
    patient_id: '',
    doctor_id: ''
  });

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.medication_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.doctor.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.doctor.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && prescription.is_active) ||
      (filterStatus === 'inactive' && !prescription.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreatePrescription = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPrescription: Prescription = {
        id: Date.now(),
        medication_name: newPrescription.medication_name,
        dosage: newPrescription.dosage,
        frequency: newPrescription.frequency,
        duration: newPrescription.duration,
        instructions: newPrescription.instructions,
        start_date: newPrescription.start_date,
        end_date: newPrescription.end_date || undefined,
        is_active: newPrescription.is_active,
        patient: {
          id: parseInt(newPrescription.patient_id) || 1,
          first_name: 'Patient',
          last_name: 'Name'
        },
        doctor: {
          id: parseInt(newPrescription.doctor_id) || 1,
          first_name: 'Doctor',
          last_name: 'Name',
          specialization: 'General'
        },
        created_at: new Date().toISOString()
      };

      setPrescriptions(prev => [mockPrescription, ...prev]);
      setSuccess('Prescription created successfully!');
      setShowCreateModal(false);
      resetForm();
      
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      console.error('Error creating prescription:', err);
      setError(err.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrescription = async () => {
    if (!token || !selectedPrescription) {
      setError('Authentication required or no prescription selected');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPrescriptions(prev => prev.map(prescription => 
        prescription.id === selectedPrescription.id 
          ? { ...prescription, ...newPrescription, id: selectedPrescription.id }
          : prescription
      ));
      
      setSuccess('Prescription updated successfully!');
      setShowEditModal(false);
      resetForm();
      
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      console.error('Error updating prescription:', err);
      setError(err.message || 'Failed to update prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = async () => {
    if (!token || !selectedPrescription) {
      setError('Authentication required or no prescription selected');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPrescriptions(prev => prev.filter(p => p.id !== selectedPrescription.id));
      setSuccess('Prescription deleted successfully!');
      setShowDeleteModal(false);
      setSelectedPrescription(null);
      
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      console.error('Error deleting prescription:', err);
      setError(err.message || 'Failed to delete prescription');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewPrescription({
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_active: true,
      patient_id: '',
      doctor_id: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (isActive: boolean, endDate?: string) => {
    if (!isActive) return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    
    if (endDate && new Date(endDate) < new Date()) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400';
    }
    
    return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
  };

  const getStatusText = (isActive: boolean, endDate?: string) => {
    if (!isActive) return 'Completed';
    
    if (endDate && new Date(endDate) < new Date()) {
      return 'Expired';
    }
    
    return 'Active';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Prescriptions
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Manage all patient prescriptions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Prescription
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search prescriptions by medication, patient, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Completed/Expired</option>
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

      {/* Prescriptions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {filteredPrescriptions.length === 0 ? (
          <div className="text-center py-12">
            <Pill className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
            <p className="text-slate-500 dark:text-slate-400">No prescriptions found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-primary dark:text-blue-400 font-medium"
            >
              Create your first prescription
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Medication</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Patient</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Doctor</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Dosage</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredPrescriptions.map(prescription => (
                  <tr key={prescription.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-4">
                      <div className="font-medium text-slate-800 dark:text-white">
                        {prescription.medication_name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {prescription.frequency} • {prescription.duration}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800 dark:text-white">
                          {prescription.patient.first_name} {prescription.patient.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800 dark:text-white">
                          Dr. {prescription.doctor.first_name} {prescription.doctor.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {prescription.dosage}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.is_active, prescription.end_date)}`}>
                        {getStatusText(prescription.is_active, prescription.end_date)}
                      </span>
                      {prescription.end_date && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Until: {formatDate(prescription.end_date)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setNewPrescription({
                              medication_name: prescription.medication_name,
                              dosage: prescription.dosage,
                              frequency: prescription.frequency,
                              duration: prescription.duration,
                              instructions: prescription.instructions || '',
                              start_date: prescription.start_date.split('T')[0],
                              end_date: prescription.end_date || '',
                              is_active: prescription.is_active,
                              patient_id: prescription.patient.id.toString(),
                              doctor_id: prescription.doctor.id.toString()
                            });
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal - Similar structure to MedicalRecords */}
      {/* Edit, View, and Delete Modals - Similar structure */}

      <div className="text-sm text-slate-500 dark:text-slate-400">
        Total: {filteredPrescriptions.length} prescriptions
      </div>
    </div>
  );
};