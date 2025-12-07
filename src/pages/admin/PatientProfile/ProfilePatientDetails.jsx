import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
} from 'lucide-react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';

// Predefined Tasks Template
const getDefaultTasks = () => ({
  nurseTasks: [
    { id: 1, task: 'Vital Signs Monitoring', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
    { id: 2, task: 'Medication Administration', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
    { id: 3, task: 'Blood Sample Collection', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
    { id: 4, task: 'Wound Dressing', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
    { id: 5, task: 'Patient Hygiene Care', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
    { id: 6, task: 'ECG Monitoring Setup', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
  ],
  labTests: [
    {
      name: 'Complete Blood Count (CBC)',
      type: 'Pathology',
      status: 'Pending',
      requestDate: new Date().toISOString().split('T')[0],
      reportDate: 'N/A',
      results: 'Awaiting sample collection',
    },
    {
      name: 'Blood Glucose',
      type: 'Pathology',
      status: 'Pending',
      requestDate: new Date().toISOString().split('T')[0],
      reportDate: 'N/A',
      results: 'Awaiting sample collection',
    },
    {
      name: 'Chest X-Ray',
      type: 'Radiology',
      status: 'Pending',
      requestDate: new Date().toISOString().split('T')[0],
      reportDate: 'N/A',
      results: 'Awaiting scan',
    },
  ],
  pharmacyIndent: [
    {
      date: new Date().toISOString().split('T')[0],
      medicineName: 'To be prescribed',
      quantity: 0,
      status: 'Pending',
      approvedBy: 'Pending',
    },
  ],
  treatmentPlan: {
    diagnosis: 'To be diagnosed by doctor',
    procedures: [
      { name: 'Initial Assessment', date: new Date().toISOString().split('T')[0], status: 'Scheduled', notes: 'Pending doctor review' },
    ],
    medications: [],
  },
  vitalsMonitoring: {
    lastUpdated: new Date().toLocaleString(),
    bloodPressure: 'N/A',
    heartRate: 'N/A',
    temperature: 'N/A',
    respiratoryRate: 'N/A',
    oxygenSaturation: 'N/A',
    status: 'Pending Assessment',
  },
  staffAssigned: {
    rmo: {
      name: 'To be assigned',
      designation: 'Resident Medical Officer',
      contact: 'N/A',
      assignedDate: new Date().toISOString().split('T')[0],
    },
    nurses: [
      { name: 'To be assigned', shift: 'Morning (6 AM - 2 PM)', assignedDate: new Date().toISOString().split('T')[0] },
      { name: 'To be assigned', shift: 'Evening (2 PM - 10 PM)', assignedDate: new Date().toISOString().split('T')[0] },
      { name: 'To be assigned', shift: 'Night (10 PM - 6 AM)', assignedDate: new Date().toISOString().split('T')[0] },
    ],
  },
});

// Main Component
export default function PatientProfileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Get patient data from navigation state or localStorage
  const [data, setData] = useState(null);

  useEffect(() => {
    // Determine active tab based on current path
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];

    if (lastPart === id) {
      setActiveTab('overview');
    } else {
      setActiveTab(lastPart);
    }
  }, [location.pathname, id]);

  useEffect(() => {
    // First try to get data from navigation state
    if (location.state?.patient) {
      const patient = location.state.patient;
      setData(transformPatientData(patient));
    } else {
      // If no state, try to load from localStorage
      try {
        const storedIpdRecords = localStorage.getItem('ipdAdmissionRecords');
        if (storedIpdRecords) {
          const records = JSON.parse(storedIpdRecords);
          const patient = records.find(p => p.id.toString() === id);
          if (patient) {
            setData(transformPatientData(patient));
          }
        }
      } catch (error) {
        console.error('Error loading patient data:', error);
      }
    }
  }, [id, location.state]);

  // Transform IPD patient data to match the display format
  const transformPatientData = (patient) => {
    const defaultTasks = getDefaultTasks();

    return {
      personalInfo: {
        name: patient.patientName || 'N/A',
        uhid: patient.admissionNumber || patient.ipdNumber || 'N/A',
        ipd: patient.ipdNumber || 'N/A',
        age: patient.age || 'N/A',
        gender: patient.gender || 'N/A',
        phone: patient.mobileNumber || patient.phoneNumber || 'N/A',
        address: `${patient.houseStreet || ''}, ${patient.areaColony || ''}, ${patient.city || ''}, ${patient.state || ''}`.trim() || 'N/A',
        bloodGroup: patient.bloodGroup || 'N/A',
        allergies: patient.allergies || 'None reported',
        emergencyContact: `${patient.kinName || 'N/A'} - ${patient.kinMobile || 'N/A'}`,
      },
      admissionInfo: {
        admissionDate: patient.timestamp || new Date().toLocaleString(),
        admissionType: patient.patientCase || 'General',
        admissionMode: patient.medicalSurgical || 'N/A',
        reasonForAdmission: patient.admissionPurpose || 'N/A',
        status: 'Active',
      },
      departmentInfo: {
        department: patient.department || 'N/A',
        ward: patient.bedLocation || patient.locationStatus || 'N/A',
        bedNumber: patient.bedNo || 'N/A',
        bedStatus: 'Occupied',
      },
      doctorInfo: {
        primaryDoctor: patient.consultantDr || 'To be assigned',
        specialty: patient.department || 'N/A',
        consultants: patient.referByDr ? [patient.referByDr] : [],
        doctorPhone: 'N/A',
        officeHours: '10:00 AM - 4:00 PM',
      },
      billing: {
        totalBilledAmount: parseFloat(patient.advanceAmount || 0),
        outstandingAmount: 0,
        paymentMode: patient.patCategory || 'N/A',
        insuranceCompany: patient.patCategory || 'N/A',
      },
      // Use predefined tasks
      ...defaultTasks,
    };
  };

  const calculateDaysInHospital = (admissionDate) => {
    if (!admissionDate) return '0';
    try {
      const admitted = new Date(admissionDate);
      const now = new Date();
      const diffTime = Math.abs(now - admitted);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays.toString();
    } catch (error) {
      return '0';
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h1>
          <p className="text-gray-600 mb-6">The patient you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/patient-profile')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Sticky Header Container */}
        <div className="sticky top-0 z-20 bg-white shadow-md">
          {/* Back Button */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <button
              onClick={() => navigate('/admin/patient-profile')}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Patients
            </button>
          </div>

          {/* Header - Green Theme */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div>
                <p className="text-xs md:text-sm opacity-90 mb-1">Name</p>
                <p className="text-sm md:text-base font-bold truncate">{data.personalInfo.name}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm opacity-90 mb-1">Admission Type</p>
                <p className="text-sm md:text-base font-bold">{data.admissionInfo.admissionType}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm opacity-90 mb-1">UHID</p>
                <p className="text-sm md:text-base font-bold">{data.personalInfo.uhid}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm opacity-90 mb-1">Admission No</p>
                <p className="text-sm md:text-base font-bold">{data.personalInfo.ipd}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm opacity-90 mb-1">Age</p>
                <p className="text-sm md:text-base font-bold">{data.personalInfo.age} Years</p>
              </div>
              <div>
                <p className="text-xs md:text-sm opacity-90 mb-1">Blood Group</p>
                <p className="text-sm md:text-base font-bold">{data.personalInfo.bloodGroup}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm opacity-90 mb-1">Department</p>
                <p className="text-sm md:text-base font-bold truncate">{data.departmentInfo.department}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm opacity-90 mb-1">Ward Name</p>
                <p className="text-sm md:text-base font-bold truncate">{data.departmentInfo.ward}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm opacity-90 mb-1">Room Number</p>
                <p className="text-sm md:text-base font-bold">{data.departmentInfo.bedNumber}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm opacity-90 mb-1">Days in Hospital</p>
                <p className="text-sm md:text-base font-bold">{data.admissionInfo.admissionDate ? calculateDaysInHospital(data.admissionInfo.admissionDate) : '0'} Days</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200 overflow-x-auto">
            <div className="flex gap-1 px-6 py-3">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'rmo', label: 'RMO Task' },
                { key: 'nursing', label: 'Nursing Task' },
                { key: 'lab', label: 'Lab' },
                { key: 'pharmacy', label: 'Pharmacy' },
                { key: 'ot', label: 'OT Task' },
                { key: 'assign-tasks', label: 'Assign Tasks' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (tab.key === 'overview') {
                      navigate(`/admin/patient-profile/${id}`, { state: { patient: location.state?.patient } });
                    } else {
                      navigate(`/admin/patient-profile/${id}/${tab.key}`, { state: { patient: location.state?.patient } });
                    }
                  }}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-6 space-y-6">
          <Outlet context={{ data, calculateDaysInHospital }} />
        </div>
      </div>
    </div>
  );
}