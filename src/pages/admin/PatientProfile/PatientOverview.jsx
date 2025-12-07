import React, { useState } from 'react';
import {
    Calendar,
    User,
    Stethoscope,
    Activity,
    Bed,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Status Badge Component
const StatusBadge = ({ status }) => {
    const getColors = () => {
        if (status === 'Completed' || status === 'Active' || status === 'Approved & Dispensed') {
            return 'bg-green-100 text-green-700 border-green-300';
        } else if (status === 'Pending' || status === 'Pending Approval') {
            return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        } else if (status === 'In Progress') {
            return 'bg-blue-100 text-blue-700 border-blue-300';
        } else if (status === 'Emergency' || status === 'Occupied') {
            return 'bg-red-100 text-red-700 border-red-300';
        } else if (status === 'Stable') {
            return 'bg-emerald-100 text-emerald-700 border-emerald-300';
        }
        return 'bg-gray-100 text-gray-700 border-gray-300';
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColors()}`}>
            {status}
        </span>
    );
};

// Expandable Section Component
const ExpandableSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
            </button>
            {isOpen && <div className="px-6 py-4 border-t border-gray-200">{children}</div>}
        </div>
    );
};

// Information Grid Component
const InfoGrid = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">{key}</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{value}</p>
            </div>
        ))}
    </div>
);

const PatientOverview = () => {
    const { data, calculateDaysInHospital } = useOutletContext();

    if (!data) return null;

    return (
        <div className="space-y-6">
            <ExpandableSection title="Personal Information" icon={User} defaultOpen={true}>
                <InfoGrid
                    data={{
                        'Full Name': data.personalInfo.name,
                        'UHID No.': data.personalInfo.uhid,
                        'IPD No.': data.personalInfo.ipd,
                        'Age': `${data.personalInfo.age} years`,
                        'Gender': data.personalInfo.gender,
                        'Blood Group': data.personalInfo.bloodGroup,
                        'Phone': data.personalInfo.phone,
                        'Address': data.personalInfo.address,
                        'Allergies': data.personalInfo.allergies,
                        'Emergency Contact': data.personalInfo.emergencyContact,
                    }}
                />
            </ExpandableSection>

            <ExpandableSection title="Admission Information" icon={Calendar} defaultOpen={true}>
                <InfoGrid
                    data={{
                        'Admission Date': data.admissionInfo.admissionDate,
                        'Admission Type': data.admissionInfo.admissionType,
                        'Mode of Admission': data.admissionInfo.admissionMode,
                        'Reason': data.admissionInfo.reasonForAdmission,
                        'Status': data.admissionInfo.status,
                        'Duration': `${data.admissionInfo.admissionDate ? calculateDaysInHospital(data.admissionInfo.admissionDate) : '0'} days`,
                    }}
                />
            </ExpandableSection>

            <ExpandableSection title="Department & Ward Information" icon={Bed} defaultOpen={true}>
                <InfoGrid
                    data={{
                        'Department': data.departmentInfo.department,
                        'Ward': data.departmentInfo.ward,
                        'Bed Number': `${data.departmentInfo.bedNumber}`,
                        'Bed Status': data.departmentInfo.bedStatus,
                    }}
                />
            </ExpandableSection>

            <ExpandableSection title="Doctor Information" icon={Stethoscope} defaultOpen={true}>
                <InfoGrid
                    data={{
                        'Primary Doctor': data.doctorInfo.primaryDoctor,
                        'Specialty': data.doctorInfo.specialty,
                        'Doctor Phone': data.doctorInfo.doctorPhone,
                        'Office Hours': data.doctorInfo.officeHours,
                    }}
                />
            </ExpandableSection>

            <ExpandableSection title="Current Vitals Monitoring" icon={Activity} defaultOpen={true}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600">Last Updated: {data.vitalsMonitoring.lastUpdated}</p>
                        <StatusBadge status={data.vitalsMonitoring.status} />
                    </div>
                    <InfoGrid
                        data={{
                            'Blood Pressure': data.vitalsMonitoring.bloodPressure,
                            'Heart Rate': data.vitalsMonitoring.heartRate,
                            'Temperature': data.vitalsMonitoring.temperature,
                            'Respiratory Rate': data.vitalsMonitoring.respiratoryRate,
                            'Oxygen Saturation': data.vitalsMonitoring.oxygenSaturation,
                        }}
                    />
                </div>
            </ExpandableSection>
        </div>
    );
};

export default PatientOverview;
