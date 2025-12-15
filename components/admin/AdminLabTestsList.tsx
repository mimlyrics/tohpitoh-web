// components/admin/AdminLabTestsList.tsx
import React, { useState } from 'react';
import { 
  FlaskConical, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  Download,
  Calendar,
  User,
  Building2,
  AlertCircle,
  Check,
  X,
  Filter,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface LabTest {
  id: number;
  test_name: string;
  test_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  ordered_date: string;
  completed_date?: string;
  results?: string;
  result_file_url?: string;
  doctor_interpretation?: string;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
  };
  doctor?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  laboratory?: {
    id: number;
    lab_name: string;
  };
  created_at: string;
}

interface AdminLabTestsListProps {
  labTests: LabTest[];
  token?: string;
  onRefresh?: () => void;
}

export const AdminLabTestsList: React.FC<AdminLabTestsListProps> = ({
  labTests: initialTests,
  token,
  onRefresh
}) => {
  const [tests, setTests] = useState<LabTest[]>(initialTests);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const [newTest, setNewTest] = useState({
    test_name: '',
    test_type: 'blood_test',
    status: 'pending' as const,
    ordered_date: new Date().toISOString().split('T')[0],
    patient_id: '',
    doctor_id: '',
    laboratory_id: '',
    notes: ''
  });

  const filteredTests = tests.filter(test => {
    const matchesSearch = 
      test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (test.doctor?.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (test.doctor?.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (test.laboratory?.lab_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateTest = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTest: LabTest = {
        id: Date.now(),
        test_name: newTest.test_name,
        test_type: newTest.test_type,
        status: newTest.status,
        ordered_date: newTest.ordered_date,
        patient: {
          id: parseInt(newTest.patient_id) || 1,
          first_name: 'Patient',
          last_name: 'Name'
        },
        doctor: newTest.doctor_id ? {
          id: parseInt(newTest.doctor_id) || 1,
          first_name: 'Doctor',
          last_name: 'Name'
        } : undefined,
        laboratory: newTest.laboratory_id ? {
          id: parseInt(newTest.laboratory_id) || 1,
          lab_name: 'Test Laboratory'
        } : undefined,
        created_at: new Date().toISOString()
      };

      setTests(prev => [mockTest, ...prev]);
      setSuccess('Lab test created successfully!');
      setShowCreateModal(false);
      resetForm();
      
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      console.error('Error creating lab test:', err);
      setError(err.message || 'Failed to create lab test');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTest = async () => {
    if (!token || !selectedTest) {
      setError('Authentication required or no test selected');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTests(prev => prev.map(test => 
        test.id === selectedTest.id 
          ? { ...test, ...newTest, id: selectedTest.id }
          : test
      ));
      
      setSuccess('Lab test updated successfully!');
      setShowEditModal(false);
      resetForm();
      
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      console.error('Error updating lab test:', err);
      setError(err.message || 'Failed to update lab test');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!token || !selectedTest) {
      setError('Authentication required or no test selected');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTests(prev => prev.filter(t => t.id !== selectedTest.id));
      setSuccess('Lab test deleted successfully!');
      setShowDeleteModal(false);
      setSelectedTest(null);
      
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      console.error('Error deleting lab test:', err);
      setError(err.message || 'Failed to delete lab test');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResults = async (testId: number, results: string, file?: File) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: 'completed',
              results: results,
              completed_date: new Date().toISOString().split('T')[0],
              result_file_url: file ? URL.createObjectURL(file) : undefined
            }
          : test
      ));
      
      setSuccess('Results updated successfully!');
      setShowResultsModal(false);
      
      if (onRefresh) onRefresh();
      
    } catch (err: any) {
      console.error('Error updating results:', err);
      setError(err.message || 'Failed to update results');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewTest({
      test_name: '',
      test_type: 'blood_test',
      status: 'pending',
      ordered_date: new Date().toISOString().split('T')[0],
      patient_id: '',
      doctor_id: '',
      laboratory_id: '',
      notes: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Lab Tests
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Manage all laboratory tests
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Test
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search tests by name, patient, or lab..."
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
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
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

      {/* Tests Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <FlaskConical className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
            <p className="text-slate-500 dark:text-slate-400">No lab tests found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-primary dark:text-blue-400 font-medium"
            >
              Create your first test
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Test Name</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Patient</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Lab</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Ordered Date</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredTests.map(test => (
                  <tr key={test.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-4">
                      <div className="font-medium text-slate-800 dark:text-white">
                        {test.test_name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                        {test.test_type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800 dark:text-white">
                          {test.patient.first_name} {test.patient.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800 dark:text-white">
                          {test.laboratory?.lab_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {formatDate(test.ordered_date)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(test.status)}`}>
                          {getStatusIcon(test.status)}
                          <span>{test.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      {test.completed_date && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Completed: {formatDate(test.completed_date)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setNewTest({
                              test_name: test.test_name,
                              test_type: test.test_type,
                              status: test.status,
                              ordered_date: test.ordered_date.split('T')[0],
                              patient_id: test.patient.id.toString(),
                              doctor_id: test.doctor?.id?.toString() || '',
                              laboratory_id: test.laboratory?.id?.toString() || '',
                              notes: ''
                            });
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </button>
                        {test.status !== 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedTest(test);
                              setShowResultsModal(true);
                            }}
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-400 hover:text-green-600"
                            title="Add Results"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {test.result_file_url && (
                          <button
                            onClick={() => window.open(test.result_file_url, '_blank')}
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

      {/* Modals - Similar structure to previous components */}
      {/* Create, Edit, View, Delete, and Results Modals */}

      <div className="text-sm text-slate-500 dark:text-slate-400">
        Total: {filteredTests.length} lab tests
      </div>
    </div>
  );
};