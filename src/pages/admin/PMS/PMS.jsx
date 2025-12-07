import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Save, X, Stethoscope, User } from 'lucide-react';

const PMS = () => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [assignments, setAssignments] = useState({});

    // Staff Data (Mock Data)
    const staffData = {
        rmos: [
            { id: 1, name: 'Dr. Rajesh Kumar', designation: 'Senior RMO' },
            { id: 2, name: 'Dr. Priya Singh', designation: 'Junior RMO' },
            { id: 3, name: 'Dr. Amit Patel', designation: 'RMO' },
            { id: 4, name: 'Dr. Sneha Gupta', designation: 'RMO' }
        ],
        nurses: [
            { id: 1, name: 'Sister Mary', designation: 'Head Nurse' },
            { id: 2, name: 'Nurse Sarah', designation: 'Staff Nurse' },
            { id: 3, name: 'Nurse John', designation: 'Staff Nurse' },
            { id: 4, name: 'Nurse Emily', designation: 'Staff Nurse' }
        ]
    };

    const [formData, setFormData] = useState({
        rmoId: '',
        rmoName: '',
        nurseId: '',
        nurseName: '',
        notes: ''
    });

    // Load data from localStorage
    useEffect(() => {
        loadData();

        const handleStorageChange = () => {
            loadData();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const loadData = () => {
        try {
            // Load IPD Patients
            const storedIpdRecords = localStorage.getItem('ipdAdmissionRecords');
            const ipdRecords = storedIpdRecords ? JSON.parse(storedIpdRecords) : [];

            // Load Assignments
            const storedAssignments = localStorage.getItem('pmsStaffAssignments');
            const loadedAssignments = storedAssignments ? JSON.parse(storedAssignments) : {};

            setPatients(ipdRecords);
            setAssignments(loadedAssignments);
        } catch (error) {
            console.error('Error loading PMS data:', error);
        }
    };

    const handleAssignClick = (patient) => {
        setSelectedPatient(patient);
        const existingAssignment = assignments[patient.ipdNumber] || {};

        setFormData({
            rmoId: existingAssignment.rmoId || '',
            rmoName: existingAssignment.rmoName || '',
            nurseId: existingAssignment.nurseId || '',
            nurseName: existingAssignment.nurseName || '',
            notes: existingAssignment.notes || ''
        });

        setShowModal(true);
    };

    const handleStaffChange = (type, value) => {
        if (type === 'rmo') {
            const staff = staffData.rmos.find(s => s.id.toString() === value);
            setFormData(prev => ({
                ...prev,
                rmoId: value,
                rmoName: staff ? staff.name : ''
            }));
        } else if (type === 'nurse') {
            const staff = staffData.nurses.find(s => s.id.toString() === value);
            setFormData(prev => ({
                ...prev,
                nurseId: value,
                nurseName: staff ? staff.name : ''
            }));
        }
    };

    const handleSave = (e) => {
        e.preventDefault();

        if (!selectedPatient) return;

        const newAssignment = {
            ...formData,
            assignedDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            patientName: selectedPatient.patientName,
            ipdNumber: selectedPatient.ipdNumber
        };

        const updatedAssignments = {
            ...assignments,
            [selectedPatient.ipdNumber]: newAssignment
        };

        setAssignments(updatedAssignments);
        localStorage.setItem('pmsStaffAssignments', JSON.stringify(updatedAssignments));

        // Also update the main patient record in localStorage to reflect assignment status if needed
        // This helps other modules know who is assigned
        updatePatientRecord(selectedPatient.ipdNumber, newAssignment);

        setShowModal(false);
        setSelectedPatient(null);
    };

    const updatePatientRecord = (ipdNumber, assignment) => {
        try {
            const storedIpdRecords = localStorage.getItem('ipdAdmissionRecords');
            if (storedIpdRecords) {
                let records = JSON.parse(storedIpdRecords);
                records = records.map(p => {
                    if (p.ipdNumber === ipdNumber) {
                        return {
                            ...p,
                            staffAssigned: {
                                rmo: {
                                    name: assignment.rmoName,
                                    id: assignment.rmoId,
                                    assignedDate: assignment.assignedDate
                                },
                                nurse: {
                                    name: assignment.nurseName,
                                    id: assignment.nurseId
                                }
                            }
                        };
                    }
                    return p;
                });
                localStorage.setItem('ipdAdmissionRecords', JSON.stringify(records));
            }
        } catch (error) {
            console.error('Error updating patient record:', error);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.ipdNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patient Staff Assignment</h1>
                    <p className="text-gray-500 mt-1">Assign RMO and Nursing staff to IPD patients</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Admission Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned RMO</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Nurse</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No IPD patients found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map((patient) => {
                                    const assignment = assignments[patient.ipdNumber];
                                    return (
                                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{patient.patientName}</span>
                                                    <span className="text-sm text-gray-500">{patient.ipdNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-900">{patient.department}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {patient.timestamp ? new Date(patient.timestamp).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {assignment?.rmoName ? (
                                                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full w-fit">
                                                        <Stethoscope className="w-3 h-3" />
                                                        <span className="text-sm font-medium">{assignment.rmoName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Not Assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {assignment?.nurseName ? (
                                                    <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-1 rounded-full w-fit">
                                                        <User className="w-3 h-3" />
                                                        <span className="text-sm font-medium">{assignment.nurseName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Not Assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${assignment ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {assignment ? 'Assigned' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleAssignClick(patient)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-end gap-1 ml-auto"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    {assignment ? 'Edit Staff' : 'Assign Staff'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assignment Modal */}
            {showModal && selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                            <h2 className="text-lg font-bold">Assign Staff</h2>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-blue-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-blue-800 font-medium">Patient: {selectedPatient.patientName}</p>
                                <p className="text-xs text-blue-600">IPD No: {selectedPatient.ipdNumber}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign RMO</label>
                                <select
                                    value={formData.rmoId}
                                    onChange={(e) => handleStaffChange('rmo', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select RMO</option>
                                    {staffData.rmos.map(staff => (
                                        <option key={staff.id} value={staff.id}>{staff.name} ({staff.designation})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Nurse</label>
                                <select
                                    value={formData.nurseId}
                                    onChange={(e) => handleStaffChange('nurse', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Nurse</option>
                                    {staffData.nurses.map(staff => (
                                        <option key={staff.id} value={staff.id}>{staff.name} ({staff.designation})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Any special instructions..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Assignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PMS;
