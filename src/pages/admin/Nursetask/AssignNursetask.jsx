
import React, { useState, useEffect } from 'react';
import {
    BedDouble,
    Calendar,
    Clock,
    Save,
    Trash2,
    Plus,
    User,
    X,
    CheckSquare,
    Filter,
    Search
} from 'lucide-react';

const AssignNursetask = () => {
    const [showBedModal, setShowBedModal] = useState(false);
    const [bedFilterType, setBedFilterType] = useState('All');
    const [occupiedBeds, setOccupiedBeds] = useState([]);
    const [nurses] = useState(['Nurse A', 'Nurse B', 'Nurse C', 'Nurse D', 'Nurse E']);
    const [predefinedTasks] = useState([
        'Vitals Check (BP, Pulse, Temp)',
        'Medication Administration',
        'IV Fluid Replacement',
        'Dressing Change',
        'Sponge Bath',
        'Feeding (Ryles Tube / Oral)',
        'Catheter Care',
        'Position Changing',
        'Nebulization',
        'Insulin Administration',
        'Blood Sugar Monitoring',
        'Sample Collection',
        'Doctor Rounds Assistance',
        'Patient Hygiene Care',
        'ECG Monitoring'
    ]);

    // Form State with validation
    const [formData, setFormData] = useState({
        ipdNumber: '',
        patientName: '',
        patientLocation: '',
        wardType: '',
        room: '',
        bedNo: '',
        assignNurse: '',
        frequency: 'Weekly',
        shift: 'Shift-A',
        startDate: '',
        reminder: 'No',
    });

    const [taskList, setTaskList] = useState([
        { id: 1, taskName: '', isCustom: false }
    ]);

    // Load Occupied Beds (Admitted Patients)
    useEffect(() => {
        const loadData = () => {
            try {
                const storedRecords = localStorage.getItem('ipdAdmissionRecords');
                if (storedRecords) {
                    const patients = JSON.parse(storedRecords);
                    // Convert patients to "Occupied Bed" format
                    // Each patient in ipdAdmissionRecords is occupying a bed
                    setOccupiedBeds(patients);
                }
            } catch (error) {
                console.error("Error loading bed data", error);
            }
        };
        loadData();
        // Optional: Add event listener for storage if we want real-time updates
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTaskChange = (id, value) => {
        setTaskList(taskList.map(task =>
            task.id === id ? { ...task, taskName: value } : task
        ));
    };

    const addTaskRow = () => {
        if (taskList.length < 15) {
            setTaskList([...taskList, { id: Date.now(), taskName: '', isCustom: false }]);
        }
    };

    const removeTaskRow = (id) => {
        if (taskList.length > 1) {
            setTaskList(taskList.filter(task => task.id !== id));
        }
    };

    const selectBed = (patient) => {
        setFormData({
            ...formData,
            ipdNumber: patient.ipdNumber || '',
            patientName: patient.patientName || '',
            patientLocation: patient.bedLocation || patient.locationStatus || '',
            wardType: patient.wardType || '',
            room: patient.room || patient.roomNo || '',
            bedNo: patient.bedNo || '',
        });
        setShowBedModal(false);
    };

    const generateTaskIds = (existingTasks, count) => {
        let lastIdNum = 0;
        if (existingTasks.length > 0) {
            // Find highest ID like TN-005
            existingTasks.forEach(t => {
                const num = parseInt(t.taskId.split('-')[1]);
                if (!isNaN(num) && num > lastIdNum) lastIdNum = num;
            });
        }

        const newIds = [];
        for (let i = 1; i <= count; i++) {
            newIds.push(`TN-${String(lastIdNum + i).padStart(3, '0')}`);
        }
        return newIds;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.ipdNumber || !formData.assignNurse || !formData.startDate) {
            alert("Please fill all required fields");
            return;
        }

        if (taskList.some(t => !t.taskName)) {
            alert("Please specify all tasks");
            return;
        }

        const duration = formData.frequency === 'Weekly' ? 7 : 15;
        const recordsToSave = [];
        const existingTasksJson = localStorage.getItem('nurseTasks');
        const existingTasks = existingTasksJson ? JSON.parse(existingTasksJson) : [];

        const startDateObj = new Date(formData.startDate);

        // We need to generate (taskList.length) * (duration) records
        const totalNewRecords = taskList.length * duration;
        const newIds = generateTaskIds(existingTasks, totalNewRecords);

        let idCounter = 0;

        taskList.forEach(taskItem => {
            for (let i = 0; i < duration; i++) {
                const currentDate = new Date(startDateObj);
                currentDate.setDate(startDateObj.getDate() + i);

                // Format date as YYYY-MM-DD for consistency
                const dateStr = currentDate.toISOString().split('T')[0];

                const record = {
                    taskId: newIds[idCounter++],
                    ipdNumber: formData.ipdNumber,
                    patientName: formData.patientName,
                    patientLocation: formData.patientLocation,
                    wardType: formData.wardType,
                    room: formData.room,
                    bedNo: formData.bedNo,
                    assignNurse: formData.assignNurse,
                    shift: formData.shift,
                    taskName: taskItem.taskName,
                    frequency: formData.frequency,
                    taskStartDate: dateStr, // This is the specific execution date
                    reminder: formData.reminder,
                    status: 'Pending',
                    createdAt: new Date().toISOString()
                };
                recordsToSave.push(record);
            }
        });

        localStorage.setItem('nurseTasks', JSON.stringify([...existingTasks, ...recordsToSave]));

        alert("Tasks assigned successfully!");
        // Reset form
        setFormData({
            ipdNumber: '',
            patientName: '',
            patientLocation: '',
            wardType: '',
            room: '',
            bedNo: '',
            assignNurse: '',
            frequency: 'Weekly',
            shift: 'Shift-A',
            startDate: '',
            reminder: 'No',
        });
        setTaskList([{ id: Date.now(), taskName: '', isCustom: false }]);
    };

    // Filter beds for modal
    const filteredBeds = occupiedBeds.filter(bed => {
        if (bedFilterType === 'All') return true;
        // Ensure we match the property names from IPD Admission
        const loc = bed.bedLocation || bed.locationStatus;
        return loc === bedFilterType;
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-blue-600">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CheckSquare className="w-8 h-8" />
                        Assign Nurse Tasks
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* Section 1: Patient Selection */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                                <User className="w-5 h-5" /> Patient Details
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowBedModal(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                            >
                                <BedDouble className="w-5 h-5" /> Select Bed (Occupied)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IPD Number</label>
                                <input type="text" name="ipdNumber" value={formData.ipdNumber} readOnly className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                                <input type="text" name="patientName" value={formData.patientName} readOnly className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Location</label>
                                <input type="text" name="patientLocation" value={formData.patientLocation} readOnly className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ward Type</label>
                                <input type="text" name="wardType" value={formData.wardType} readOnly className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                                <input type="text" name="room" value={formData.room} readOnly className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bed No.</label>
                                <input type="text" name="bedNo" value={formData.bedNo} readOnly className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-700" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Task Assignment */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Nurse</label>
                                <select
                                    name="assignNurse"
                                    value={formData.assignNurse}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Nurse</option>
                                    {nurses.map(nurse => <option key={nurse} value={nurse}>{nurse}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                                <select
                                    name="shift"
                                    value={formData.shift}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Shift-A">Shift-A</option>
                                    <option value="Shift-B">Shift-B</option>
                                    <option value="Shift-C">Shift-C</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder</label>
                                <select
                                    name="reminder"
                                    value={formData.reminder}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                                <select
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Weekly">Weekly (7 Days)</option>
                                    <option value="15 Days">15 Days</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Tasks</label>
                                <button
                                    type="button"
                                    onClick={addTaskRow}
                                    disabled={taskList.length >= 15}
                                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition disabled:opacity-50"
                                >
                                    + Add Another Task
                                </button>
                            </div>

                            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 custom-scrollbar max-h-96 overflow-y-auto">
                                {taskList.map((task, index) => (
                                    <div key={task.id} className="flex gap-3 items-center">
                                        <span className="text-gray-500 text-sm font-medium w-6">{index + 1}.</span>
                                        <select
                                            value={task.taskName}
                                            onChange={(e) => handleTaskChange(task.id, e.target.value)}
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Select Task</option>
                                            {predefinedTasks.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        {taskList.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeTaskRow(task.id)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-right">Max 15 tasks allowed</p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition shadow-lg flex justify-center items-center gap-2"
                        >
                            <Save className="w-5 h-5" /> Save Assignment
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="flex-1 bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition shadow-lg"
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            </div>

            {/* Bed Selection Modal */}
            {showBedModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Select Occupied Bed</h2>
                            <button onClick={() => setShowBedModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        <div className="p-4 bg-white border-b border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                {['All', 'General Male Ward', 'General Female Ward', 'ICU', 'Private Ward', 'PICU', 'NICU', 'Emergency', 'HDU', 'General Ward(5th floor)'].map((filter) => (
                                    <button
                                        key={filter}
                                        type="button"
                                        onClick={() => setBedFilterType(filter)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${bedFilterType === filter
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            {filteredBeds.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-lg">No occupied beds found for this filter.</p>
                                    <p className="text-sm">Patients must be admitted via IPD Admission to show up here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {filteredBeds.map((patient, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => selectBed(patient)}
                                            className="bg-white border-2 border-red-200 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:shadow-lg transition group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-bl-lg font-bold">
                                                Occupied
                                            </div>
                                            <div className="flex justify-center mb-3 text-red-500 group-hover:text-blue-500 transition-colors">
                                                <BedDouble size={28} />
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-center mb-1">{patient.bedNo}</h4>
                                            <p className="text-xs text-center text-gray-500">{patient.patientName}</p>
                                            <p className="text-xs text-center text-gray-400 mt-1 truncate">{patient.bedLocation || patient.locationStatus}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignNursetask;
