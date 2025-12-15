// components/admin/AdminMedicalRecordsList.tsx
import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  Download,
  Calendar,
  User,
  Stethoscope,
  X,
  Check,
  AlertCircle,
  Filter,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';

interface MedicalRecord {
  id: number;
  title: string;
  description?: string;
  record_type: string;
  date: string;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  doctor?: {
    id: number;
    first_name: string;
    last_name: string;
    specialization?: string;
  };
  file_url?: string;
  is_shared: boolean;
  created_at: string;
}

interface AdminMedicalRecordsListProps {
  medicalRecords: MedicalRecord[];
  token?: string;
  onRefresh?: () => void;
}

export const AdminMedicalRecordsList: React.FC<AdminMedicalRecordsListProps> = ({
  medicalRecords: initialRecords,
  token,
  onRefresh
}) => {
  const [records, setRecords] = useState<MedicalRecord[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Form states
  const [newRecord, setNewRecord] = useState({
    title: '',
    description: '',
    record_type: 'consultation',
    date: new Date().toISOString().split('T')[0],
    patient_id: '',
    doctor_id: '',
    file: null as File | null,
    is_shared: false
  });

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || record.record_type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Get unique record types
  const recordTypes = Array.from(new Set(records.map(r => r.record_type)));

  const handleCreateRecord = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // In a real app, you would upload the file first, then create the record
      const formData = new FormData();
      formData.append('title', newRecord.title);
      formData.append('description', newRecord.description);
      formData.append('record_type', newRecord.record_type);
      formData.append('date', newRecord.date);
      formData.append('patient_id', newRecord.patient_id);
      if (newRecord.doctor_id) formData.append('doctor_id', newRecord.doctor_id);
      formData.append('is_shared', newRecord.is_shared.toString());
      if (newRecord.file) formData.append('file', newRecord.file);

      // Since we don't have the exact API endpoint, we'll simulate it
      // In reality, you would call: await api.admin.createMedicalRecord(token, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add mock record
      const mockRecord: MedicalRecord = {
        id: Date.now(),
        title: newRecord.title,
        description: newRecord.description,
        record_type: newRecord.record_type,
        date: newRecord.date,
        patient: {
          id: parseInt(newRecord.patient_id) || 1,
          first_name: 'Patient',
          last_name: 'Name',
          email: 'patient@example.com'
        },
        doctor: newRecord.doctor_id ? {
          id: parseInt(newRecord.doctor_id) || 1,
          first_name: 'Doctor',
          last_name: 'Name',
          specialization: 'General'
        } : undefined,
        is_shared: newRecord.is_shared,
        created_at: new Date().toISOString()
      };

      setRecords(prev => [mockRecord, ...prev]);
      setSuccess('Medical record created successfully!');
      setShowCreateModal(false);
      resetForm();
      
      // Refresh parent component if callback provided
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      console.error('Error creating medical record:', err);
      setError(err.message || 'Failed to create medical record');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async () => {
    if (!token || !selectedRecord) {
      setError('Authentication required or no record selected');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // In reality: await api.admin.updateMedicalRecord(token, selectedRecord.id, updateData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecords(prev => prev.map(record => 
        record.id === selectedRecord.id 
          ? { ...record, ...newRecord, id: selectedRecord.id }
          : record
      ));
      
      setSuccess('Medical record updated successfully!');
      setShowEditModal(false);
      resetForm();
      
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      console.error('Error updating medical record:', err);
      setError(err.message || 'Failed to update medical record');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!token || !selectedRecord) {
      setError('Authentication required or no record selected');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // In reality: await api.admin.deleteMedicalRecord(token, selectedRecord.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecords(prev => prev.filter(record => record.id !== selectedRecord.id));
      setSuccess('Medical record deleted successfully!');
      setShowDeleteModal(false);
      setSelectedRecord(null);
      
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      console.error('Error deleting medical record:', err);
      setError(err.message || 'Failed to delete medical record');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewRecord({
      title: '',
      description: '',
      record_type: 'consultation',
      date: new Date().toISOString().split('T')[0],
      patient_id: '',
      doctor_id: '',
      file: null,
      is_shared: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Medical Records
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Manage all patient medical records
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search records by patient name, title, or description..."
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
            {recordTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
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

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
            <p className="text-slate-500 dark:text-slate-400">No medical records found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-primary dark:text-blue-400 font-medium"
            >
              Create your first record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Title</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Patient</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-4">
                      <div className="font-medium text-slate-800 dark:text-white">
                        {record.title}
                      </div>
                      {record.description && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {record.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-800 dark:text-white">
                            {record.patient.first_name} {record.patient.last_name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {record.patient.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.record_type === 'consultation' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                          : record.record_type === 'diagnosis'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                          : record.record_type === 'prescription'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400'
                      }`}>
                        {record.record_type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {formatDate(record.date)}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.is_shared
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {record.is_shared ? 'Shared' : 'Private'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setNewRecord({
                              title: record.title,
                              description: record.description || '',
                              record_type: record.record_type,
                              date: record.date.split('T')[0],
                              patient_id: record.patient.id.toString(),
                              doctor_id: record.doctor?.id?.toString() || '',
                              file: null,
                              is_shared: record.is_shared
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
                            setSelectedRecord(record);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {record.file_url && (
                          <button
                            onClick={() => window.open(record.file_url, '_blank')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-slate-400" />
                          </button>
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

      {/* Pagination */}
      {filteredRecords.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredRecords.length} of {records.length} records
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
              Previous
            </button>
            <button className="px-3 py-2 bg-primary text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
              2
            </button>
            <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Add Medical Record
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newRecord.title}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  placeholder="Enter record title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newRecord.description}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[100px]"
                  placeholder="Enter record description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                    Record Type *
                  </label>
                  <select
                    value={newRecord.record_type}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, record_type: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="diagnosis">Diagnosis</option>
                    <option value="prescription">Prescription</option>
                    <option value="lab_result">Lab Result</option>
                    <option value="surgery">Surgery</option>
                    <option value="vaccination">Vaccination</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                    Patient ID *
                  </label>
                  <input
                    type="text"
                    value={newRecord.patient_id}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, patient_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    placeholder="Enter patient ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                    Doctor ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={newRecord.doctor_id}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, doctor_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    placeholder="Enter doctor ID"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Attach File (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewRecord(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_shared"
                  checked={newRecord.is_shared}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, is_shared: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="is_shared" className="ml-2 text-sm text-slate-600 dark:text-slate-300">
                  Share this record with the patient
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRecord}
                disabled={loading || !newRecord.title || !newRecord.patient_id}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Record'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Similar modals for Edit, View, and Delete would go here */}
      {/* They follow the same pattern as Create Modal */}
    </div>
  );
};