// services/api.ts (COMPLETE CORRECTED VERSION)
import { 
  MedicalRecord, 
  FullProfile, 
  AdminStats, 
  User, 
  RegistrationPayload,
  Patient,
  Doctor,
  Laboratory,
  Prescription,
  LabTest
} from '../types';

const BASE_URL = 'https://tohpitoh-api.onrender.com/api/v1';

// Helper for headers
const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Error handling helper
const handleResponse = async (response: Response) => {
  // Handle 204 No Content
  if (response.status === 204) {
    return {};
  }
  
  // Handle 404 - Not Found (gracefully)
  if (response.status === 404) {
    const errorText = await response.text();
    console.warn(`404 Error: ${response.url} - ${errorText}`);
    throw new Error('Resource not found');
  }
  
  // Handle 403 - Forbidden
  if (response.status === 403) {
    const errorText = await response.text();
    try {
      const jsonError = JSON.parse(errorText);
      throw new Error(jsonError.message || 'Access denied');
    } catch (e) {
      throw new Error('Access denied: Insufficient permissions');
    }
  }
  
  // Handle 401 - Unauthorized
  if (response.status === 401) {
    throw new Error('Authentication required');
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    try {
      const jsonError = JSON.parse(errorText);
      throw new Error(jsonError.message || `HTTP Error: ${response.status}`);
    } catch (e) {
      throw new Error(errorText || `HTTP Error: ${response.status}`);
    }
  }
  
  return response.json();
};

export const api = {
  // ==================== AUTHENTICATION ====================
  login: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/jwt/auth`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (payload: RegistrationPayload) => {
    const response = await fetch(`${BASE_URL}/jwt/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  logout: async (token: string) => {
    const response = await fetch(`${BASE_URL}/jwt/logout`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  // ==================== USER PROFILE ====================
  // Note: There's no /jwt/profile endpoint. Use patient/doctor/lab endpoints instead.
  getCurrentUser: async (token: string): Promise<User> => {
    // This is a placeholder - you'll need to implement getUser endpoint
    // For now, we'll get profile based on role
    try {
      // Try to get user info from auth response stored in localStorage
      const authData = localStorage.getItem('authData');
      if (authData) {
        return JSON.parse(authData).user;
      }
      
      // If no stored data, you might need to hit an endpoint like /users/me
      // For now, return basic info
      return {
        id: 0,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'user',
        is_active: true,
        is_verified: false
      };
    } catch (err) {
      console.error('Error getting current user:', err);
      throw err;
    }
  },

  getFullProfile: async (token: string): Promise<FullProfile> => {
    // Get user from token or stored data
    const userData = await api.getCurrentUser(token);
    
    let patientData: Patient | null = null;
    let doctorData: Doctor | null = null;
    let laboratoryData: Laboratory | null = null;
    
    // Based on role, fetch specific profile
    try {
      switch (userData.role) {
        case 'patient':
          try {
            const patientResponse = await fetch(`${BASE_URL}/patients/profile`, {
              headers: getHeaders(token),
            });
            if (patientResponse.ok) {
              const patientRes = await patientResponse.json();
              patientData = patientRes.data || patientRes;
            }
          } catch (e) {
            console.warn('Could not fetch patient profile:', e);
          }
          break;
          
        case 'doctor':
          try {
            const doctorResponse = await fetch(`${BASE_URL}/doctors/profile/me`, {
              headers: getHeaders(token),
            });
            if (doctorResponse.ok) {
              const doctorRes = await doctorResponse.json();
              doctorData = doctorRes.data || doctorRes;
            }
          } catch (e) {
            console.warn('Could not fetch doctor profile:', e);
          }
          break;
          
        case 'laboratory':
          try {
            const labResponse = await fetch(`${BASE_URL}/laboratories/profile/me`, {
              headers: getHeaders(token),
            });
            if (labResponse.ok) {
              const labRes = await labResponse.json();
              laboratoryData = labRes.data || labRes;
            }
          } catch (e) {
            console.warn('Could not fetch laboratory profile:', e);
          }
          break;
      }
    } catch (err) {
      console.error('Error fetching role profile:', err);
    }

    return {
      user: userData,
      patient: patientData,
      doctor: doctorData,
      laboratory: laboratoryData
    };
  },

  // ==================== PATIENT ENDPOINTS ====================
  patient: {
    getProfile: async (token: string): Promise<Patient> => {
      const response = await fetch(`${BASE_URL}/patients/profile`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data;
    },

    updateProfile: async (token: string, patientData: any) => {
      const response = await fetch(`${BASE_URL}/patients/profile/me`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(patientData),
      });
      return handleResponse(response);
    },

    getMedicalRecords: async (token: string): Promise<MedicalRecord[]> => {
      const response = await fetch(`${BASE_URL}/patients/medical-records`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data.records || data || [];
    },

    getPrescriptions: async (token: string): Promise<Prescription[]> => {
      const response = await fetch(`${BASE_URL}/patients/prescriptions`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getAllPrescriptions: async (token: string): Promise<Prescription[]> => {
      const response = await fetch(`${BASE_URL}/patients/prescriptions/all`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getPrescriptionStats: async (token: string) => {
      const response = await fetch(`${BASE_URL}/patients/prescriptions/stats`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    getPrescriptionById: async (token: string, prescriptionId: number) => {
      const response = await fetch(`${BASE_URL}/patients/prescriptions/${prescriptionId}`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    markPrescriptionCompleted: async (token: string, prescriptionId: number) => {
      const response = await fetch(`${BASE_URL}/patients/prescriptions/${prescriptionId}/complete`, {
        method: 'PUT',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    getLabTests: async (token: string): Promise<LabTest[]> => {
      const response = await fetch(`${BASE_URL}/patients/lab-tests`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getLabTestById: async (token: string, testId: number) => {
      const response = await fetch(`${BASE_URL}/patients/lab-tests/${testId}`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    configureEmergencyAccess: async (token: string, enabled: boolean, code?: string) => {
      const response = await fetch(`${BASE_URL}/patients/emergency-access`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ enabled, code }),
      });
      return handleResponse(response);
    },

    // Access Permissions
    getGrantedAccesses: async (token: string) => {
      const response = await fetch(`${BASE_URL}/patients/granted-accesses`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    grantAccess: async (token: string, accessData: any) => {
      const response = await fetch(`${BASE_URL}/patients/grant`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(accessData),
      });
      return handleResponse(response);
    },

    revokeAccess: async (token: string, accessPermissionId: number) => {
      const response = await fetch(`${BASE_URL}/patients/revoke/${accessPermissionId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    // Available Doctors for Patients
    getAllDoctors: async (token: string): Promise<Doctor[]> => {
      const response = await fetch(`${BASE_URL}/doctors`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },
  },

  // ==================== DOCTOR ENDPOINTS ====================
  doctor: {
    getMyProfile: async (token: string): Promise<Doctor> => {
      const response = await fetch(`${BASE_URL}/doctors/profile/me`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data;
    },

    updateMyProfile: async (token: string, profileData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/profile/me`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(profileData),
      });
      return handleResponse(response);
    },

    // Medical Records
    searchMedicalRecords: async (token: string, searchParams: any) => {
      const query = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${BASE_URL}/doctors/medical-records/search?${query}`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getMedicalRecordStats: async (token: string) => {
      const response = await fetch(`${BASE_URL}/doctors/medical-records/stats`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    getMedicalRecordById: async (token: string, recordId: number) => {
      const response = await fetch(`${BASE_URL}/doctors/medical-records/${recordId}`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    updateMedicalRecord: async (token: string, recordId: number, recordData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/medical-records/${recordId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(recordData),
      });
      return handleResponse(response);
    },

    deleteMedicalRecord: async (token: string, recordId: number) => {
      const response = await fetch(`${BASE_URL}/doctors/medical-records/${recordId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    addMedicalRecord: async (token: string, patientId: number, recordData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/patients/${patientId}/medical-records`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(recordData),
      });
      return handleResponse(response);
    },

    getPatientMedicalRecords: async (token: string, patientId: number) => {
      const response = await fetch(`${BASE_URL}/doctors/patients/${patientId}/medical-records`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getRecordTypes: async (token: string) => {
      const response = await fetch(`${BASE_URL}/doctors/record-types`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    // Prescriptions
    createPrescription: async (token: string, prescriptionData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/prescriptions`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(prescriptionData),
      });
      return handleResponse(response);
    },

    getDoctorPrescriptions: async (token: string): Promise<Prescription[]> => {
      const response = await fetch(`${BASE_URL}/doctors/prescriptions`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getPrescriptionById: async (token: string, prescriptionId: number) => {
      const response = await fetch(`${BASE_URL}/doctors/prescriptions/${prescriptionId}`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    updatePrescription: async (token: string, prescriptionId: number, prescriptionData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(prescriptionData),
      });
      return handleResponse(response);
    },

    deletePrescription: async (token: string, prescriptionId: number) => {
      const response = await fetch(`${BASE_URL}/doctors/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    getPatientPrescriptions: async (token: string, patientId: number): Promise<Prescription[]> => {
      const response = await fetch(`${BASE_URL}/doctors/patients/${patientId}/prescriptions`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getPrescriptionStats: async (token: string) => {
      const response = await fetch(`${BASE_URL}/doctors/prescriptions/stats`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    // Lab Tests
    createLabTest: async (token: string, labTestData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/lab-tests`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(labTestData),
      });
      return handleResponse(response);
    },

    getDoctorLabTests: async (token: string): Promise<LabTest[]> => {
      const response = await fetch(`${BASE_URL}/doctors/lab-tests`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getLabTestById: async (token: string, testId: number) => {
      const response = await fetch(`${BASE_URL}/doctors/lab-tests/${testId}`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    interpretLabResults: async (token: string, testId: number, interpretation: string) => {
      const response = await fetch(`${BASE_URL}/doctors/lab-tests/${testId}/interpret`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ doctor_interpretation: interpretation }),
      });
      return handleResponse(response);
    },

    cancelLabTest: async (token: string, testId: number) => {
      const response = await fetch(`${BASE_URL}/doctors/lab-tests/${testId}/cancel`, {
        method: 'PUT',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    checkPatientAccess: async (token: string, patientId: number) => {
      const response = await fetch(`${BASE_URL}/patients/check-access/${patientId}`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    getAllDoctors: async (token: string): Promise<Doctor[]> => {
      const response = await fetch(`${BASE_URL}/doctors`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },
  },

  // ==================== LABORATORY ENDPOINTS ====================
  laboratory: {
    getMyProfile: async (token: string): Promise<Laboratory> => {
      const response = await fetch(`${BASE_URL}/laboratories/profile/me`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data;
    },

    updateMyProfile: async (token: string, profileData: any) => {
      const response = await fetch(`${BASE_URL}/laboratories/profile/me`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(profileData),
      });
      return handleResponse(response);
    },

    getLaboratoryTests: async (token: string): Promise<LabTest[]> => {
      const response = await fetch(`${BASE_URL}/laboratories/tests`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getTestDetails: async (token: string, testId: number) => {
      const response = await fetch(`${BASE_URL}/laboratories/tests/${testId}`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    updateTestResults: async (token: string, testId: number, results: any) => {
      const response = await fetch(`${BASE_URL}/laboratories/tests/${testId}/results`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(results),
      });
      return handleResponse(response);
    },

    getPrescribedExams: async (token: string) => {
      const response = await fetch(`${BASE_URL}/laboratories/prescribed-exams`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    updateExamStatus: async (token: string, examData: any) => {
      const response = await fetch(`${BASE_URL}/laboratories/update-exam-status`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(examData),
      });
      return handleResponse(response);
    },

    depositResults: async (token: string, resultsData: any) => {
      const response = await fetch(`${BASE_URL}/laboratories/deposit-results`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(resultsData),
      });
      return handleResponse(response);
    },

    getAllLaboratories: async (token: string): Promise<Laboratory[]> => {
      const response = await fetch(`${BASE_URL}/laboratories`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },
  },

  // ==================== ADMIN ENDPOINTS ====================
  admin: {
    // Dashboard & Statistics
    getDashboardStats: async (token: string): Promise<AdminStats> => {
      // Using /admin/statistics as per your routes
      const response = await fetch(`${BASE_URL}/admin/statistics`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
    return {
      totalUsers: data.data?.totalUsers || 0,
      totalPatients: data.data?.totalPatients || 0,
      totalDoctors: data.data?.totalDoctors || 0,
      totalLabs: data.data?.totalLaboratories || 0,
      totalMedicalRecords: data.data?.totalMedicalRecords || 0,
      totalPrescriptions: data.data?.totalPrescriptions || 0,
      totalLabTests: data.data?.totalLabTests || 0,
      pendingApprovals: 0, // You might need a separate endpoint for this
      activeRecords: data.data?.totalActiveAccesses || 0,
      todayActivity: 0, // You might need a separate endpoint for this
      verifiedProfessionals: data.data?.totalDoctors + data.data?.totalLaboratories || 0
    };
    },

    getSystemStatistics: async (token: string): Promise<AdminStats> => {
      const response = await fetch(`${BASE_URL}/admin/statistics`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data;
    },

    // User Management
    getAllUsers: async (token: string): Promise<User[]> => {
      const response = await fetch(`${BASE_URL}/admin/users`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getAllUsersLegacy: async (token: string): Promise<User[]> => {
      const response = await fetch(`${BASE_URL}/admin/all-users`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getUserById: async (token: string, userId: number) => {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    updateUser: async (token: string, userId: number, userData: any) => {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },

    deleteUser: async (token: string, userId: number) => {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    // Professional Validation
    getPendingValidations: async (token: string) => {
      const response = await fetch(`${BASE_URL}/admin/pending-validations`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    validateProfessional: async (token: string, data: any) => {
      const response = await fetch(`${BASE_URL}/admin/validate-professional`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getAccessRequests: async (token: string) => {
      const response = await fetch(`${BASE_URL}/admin/access-requests`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    manageUserAccount: async (token: string, userData: any) => {
      const response = await fetch(`${BASE_URL}/admin/manage-user`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },

    // Doctor Management
    getAllDoctors: async (token: string): Promise<Doctor[]> => {
      const response = await fetch(`${BASE_URL}/admin/doctors`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getDoctorById: async (token: string, doctorId: number) => {
      const response = await fetch(`${BASE_URL}/admin/doctors/${doctorId}`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    approveDoctor: async (token: string, doctorId: number) => {
      const response = await fetch(`${BASE_URL}/admin/doctors/${doctorId}/approve`, {
        method: 'PUT',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    rejectDoctor: async (token: string, doctorId: number, reason?: string) => {
      const response = await fetch(`${BASE_URL}/admin/doctors/${doctorId}/reject`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ reason }),
      });
      return handleResponse(response);
    },

    deleteDoctor: async (token: string, doctorId: number) => {
      const response = await fetch(`${BASE_URL}/admin/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    // Patient Management
    getAllPatients: async (token: string): Promise<Patient[]> => {
      const response = await fetch(`${BASE_URL}/admin/patients`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getPatientById: async (token: string, patientId: number) => {
      const response = await fetch(`${BASE_URL}/admin/patients/${patientId}`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    updatePatient: async (token: string, patientId: number, patientData: any) => {
      const response = await fetch(`${BASE_URL}/admin/patients/${patientId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(patientData),
      });
      return handleResponse(response);
    },

    deletePatient: async (token: string, patientId: number) => {
      const response = await fetch(`${BASE_URL}/admin/patients/${patientId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    // Laboratory Management
    getAllLaboratories: async (token: string): Promise<Laboratory[]> => {
      const response = await fetch(`${BASE_URL}/admin/laboratories`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return data.data || data || [];
    },

    getLaboratoryById: async (token: string, laboratoryId: number) => {
      const response = await fetch(`${BASE_URL}/admin/laboratories/${laboratoryId}`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    approveLaboratory: async (token: string, laboratoryId: number) => {
      const response = await fetch(`${BASE_URL}/admin/laboratories/${laboratoryId}/approve`, {
        method: 'PUT',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    rejectLaboratory: async (token: string, laboratoryId: number, reason?: string) => {
      const response = await fetch(`${BASE_URL}/admin/laboratories/${laboratoryId}/reject`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ reason }),
      });
      return handleResponse(response);
    },

    deleteLaboratory: async (token: string, laboratoryId: number) => {
      const response = await fetch(`${BASE_URL}/admin/laboratories/${laboratoryId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },
  },
};