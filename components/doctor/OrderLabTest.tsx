// components/doctor/OrderLabTest.tsx
import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Search, 
  X, 
  Building2, 
  Calendar,
  AlertCircle,
  Check,
  Loader2,
  User,
  ClipboardList
} from 'lucide-react';
import { api } from '../../services/api';

interface Patient {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Laboratory {
  id: number;
  lab_name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface OrderLabTestProps {
  token: string;
  doctorId: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const OrderLabTest: React.FC<OrderLabTestProps> = ({
  token,
  doctorId,
  onSuccess,
  onClose
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [labSearch, setLabSearch] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<Laboratory[]>([]);
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [showPatientSearch, setShowPatientSearch] = useState(true);
  const [showLabSearch, setShowLabSearch] = useState(true);
  
  const [formData, setFormData] = useState({
    test_name: '',
    test_type: 'blood_test',
    test_instructions: '',
    ordered_date: new Date().toISOString().split('T')[0],
    priority: 'routine'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientsData, labsData] = await Promise.all([
          api.doctor.getPatients(token),
          api.doctor.getLaboratories(token)
        ]);
        
        setPatients(patientsData);
        setFilteredPatients(patientsData);
        setLaboratories(labsData);
        setFilteredLabs(labsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load required data');
      }
    };

    loadData();
  }, [token]);

  // Filter patients
  useEffect(() => {
    if (patientSearch.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.user.first_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        patient.user.last_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        patient.user.email.toLowerCase().includes(patientSearch.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [patientSearch, patients]);

  // Filter labs
  useEffect(() => {
    if (labSearch.trim() === '') {
      setFilteredLabs(laboratories);
    } else {
      const filtered = laboratories.filter(lab => 
        lab.lab_name.toLowerCase().includes(labSearch.toLowerCase()) ||
        (lab.address?.toLowerCase() || '').includes(labSearch.toLowerCase()) ||
        (lab.phone?.toLowerCase() || '').includes(labSearch.toLowerCase())
      );
      setFilteredLabs(filtered);
    }
  }, [labSearch, laboratories]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
  };

  const handleLabSelect = (lab: Laboratory) => {
    setSelectedLab(lab);
    setShowLabSearch(false);
  };

  const handleSubmit = async () => {
    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }
    if (!selectedLab) {
      setError('Please select a laboratory');
      return;
    }
    if (!formData.test_name.trim()) {
      setError('Test name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const labTestData = {
        patient_id: selectedPatient.id,
        doctor_id: doctorId,
        laboratory_id: selectedLab.id,
        test_name: formData.test_name,
        test_type: formData.test_type,
        test_instructions: formData.test_instructions,
        ordered_date: formData.ordered_date,
        priority: formData.priority,
        status: 'pending'
      };

      await api.doctor.orderLabTest(token, labTestData);
      
      setSuccess('Lab test ordered successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to order lab test');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setSelectedLab(null);
    setFormData({
      test_name: '',
      test_type: 'blood_test',
      test_instructions: '',
      ordered_date: new Date().toISOString().split('T')[0],
      priority: 'routine'
    });
    setShowPatientSearch(true);
    setShowLabSearch(true);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          Order Lab Test
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check size={18} />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Patient Selection */}
      {showPatientSearch && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
            Select Patient *
          </label>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            {filteredPatients.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                No patients found
              </div>
            ) : (
              filteredPatients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {patient.user.first_name} {patient.user.last_name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {patient.user.email}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected Patient */}
      {selectedPatient && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-white">
                  {selectedPatient.user.first_name} {selectedPatient.user.last_name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedPatient.user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedPatient(null);
                setShowPatientSearch(true);
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Laboratory Selection */}
      {selectedPatient && showLabSearch && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
            Select Laboratory *
          </label>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search laboratories by name, address, or phone..."
              value={labSearch}
              onChange={(e) => setLabSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            {filteredLabs.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                No laboratories found
              </div>
            ) : (
              filteredLabs.map(lab => (
                <button
                  key={lab.id}
                  onClick={() => handleLabSelect(lab)}
                  className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {lab.lab_name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {lab.address}
                      </p>
                      {lab.phone && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {lab.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected Laboratory */}
      {selectedLab && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-white">
                  {selectedLab.lab_name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedLab.address}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedLab(null);
                setShowLabSearch(true);
              }}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Test Details Form */}
      {selectedPatient && selectedLab && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Test Name *
            </label>
            <input
              type="text"
              value={formData.test_name}
              onChange={(e) => setFormData({...formData, test_name: e.target.value})}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              placeholder="e.g., Complete Blood Count (CBC), Lipid Profile"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Test Type *
              </label>
              <select
                value={formData.test_type}
                onChange={(e) => setFormData({...formData, test_type: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="blood_test">Blood Test</option>
                <option value="urinalysis">Urinalysis</option>
                <option value="imaging">Imaging</option>
                <option value="biopsy">Biopsy</option>
                <option value="culture">Culture</option>
                <option value="genetic">Genetic Test</option>
                <option value="allergy">Allergy Test</option>
                <option value="hormone">Hormone Test</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT (Immediate)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Order Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="date"
                value={formData.ordered_date}
                onChange={(e) => setFormData({...formData, ordered_date: e.target.value})}
                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Instructions for Laboratory (Optional)
            </label>
            <textarea
              value={formData.test_instructions}
              onChange={(e) => setFormData({...formData, test_instructions: e.target.value})}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[80px]"
              placeholder="Special instructions for the laboratory..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
              disabled={loading}
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ordering...
                </>
              ) : (
                'Order Test'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};