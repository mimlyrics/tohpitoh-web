// components/doctor/CreateMedicalRecord.tsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  X, 
  Upload, 
  User, 
  Calendar, 
  Stethoscope,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';

interface Patient {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  date_of_birth?: string;
  blood_type?: string;
}

interface CreateMedicalRecordProps {
  token: string;
  doctorId: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const CreateMedicalRecord: React.FC<CreateMedicalRecordProps> = ({
  token,
  doctorId,
  onSuccess,
  onClose
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientSearch, setShowPatientSearch] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    record_type: 'consultation',
    date: new Date().toISOString().split('T')[0],
    is_shared: true
  });
  
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const patientsData = await api.doctor.getPatients(token);
        setPatients(patientsData);
        setFilteredPatients(patientsData);
      } catch (err) {
        console.error('Failed to load patients:', err);
        setError('Failed to load patients list');
      }
    };

    loadPatients();
  }, [token]);

  // Search patients
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.user.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
  };

  const handleSubmit = async () => {
    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('patient_id', selectedPatient.id.toString());
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('record_type', formData.record_type);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('doctor_id', doctorId.toString());
      formDataToSend.append('is_shared', formData.is_shared.toString());
      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      await api.doctor.createMedicalRecord(token, formDataToSend);
      
      setSuccess('Medical record created successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create medical record');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setFormData({
      title: '',
      description: '',
      record_type: 'consultation',
      date: new Date().toISOString().split('T')[0],
      is_shared: true
    });
    setAttachment(null);
    setShowPatientSearch(true);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          Create Medical Record
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
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 dark:text-white">
                        {patient.user.first_name} {patient.user.last_name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {patient.user.email} • {patient.user.phone || 'No phone'}
                      </p>
                      {patient.date_of_birth && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          DOB: {new Date(patient.date_of_birth).toLocaleDateString()} • 
                          Blood: {patient.blood_type || 'Unknown'}
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

      {/* Medical Record Form */}
      {selectedPatient && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              placeholder="e.g., Follow-up Consultation, Diagnosis Report"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[120px]"
              placeholder="Provide detailed notes about the consultation or diagnosis..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Record Type *
              </label>
              <select
                value={formData.record_type}
                onChange={(e) => setFormData({...formData, record_type: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="consultation">Consultation</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="prescription">Prescription</option>
                <option value="vaccination">Vaccination</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Attach File (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div className="px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 text-center">
                  <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {attachment ? attachment.name : 'Click to upload file'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    PDF, DOC, JPG, PNG up to 10MB
                  </p>
                </div>
              </label>
              {attachment && (
                <button
                  onClick={() => setAttachment(null)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_shared"
              checked={formData.is_shared}
              onChange={(e) => setFormData({...formData, is_shared: e.target.checked})}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="is_shared" className="ml-2 text-sm text-slate-600 dark:text-slate-300">
              Share this record with the patient
            </label>
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
              disabled={loading || !formData.title.trim()}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
      )}
    </div>
  );
};