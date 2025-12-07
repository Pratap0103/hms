
import React, { useState, useEffect } from 'react';
import {
    ClipboardList,
    Search,
    MapPin,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    Filter
} from 'lucide-react';

const Tasks = () => {
    const [activeTab, setActiveTab] = useState('Pending'); // 'Pending' or 'History'
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        loadTasks();
        const interval = setInterval(loadTasks, 2000); // Auto-refresh for new updates
        return () => clearInterval(interval);
    }, []);

    const loadTasks = () => {
        const storedTasks = localStorage.getItem('nurseTasks');
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusUpdate = (taskId, newStatus) => {
        const updatedTasks = tasks.map(t =>
            t.taskId === taskId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);
        localStorage.setItem('nurseTasks', JSON.stringify(updatedTasks));
    };

    // Logic to separate Pending vs History
    // Pending: Date is Today or Future, AND Status is NOT Completed
    // History: Date is Past OR Status IS Completed
    const today = new Date().toISOString().split('T')[0];

    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.ipdNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.taskId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDate = filterDate ? task.taskStartDate === filterDate : true;

        if (!matchesSearch || !matchesDate) return false;

        if (activeTab === 'Pending') {
            return task.status !== 'Completed'; // Simple logic: Show everything not done
        } else {
            return task.status === 'Completed'; // Show completed items in history
        }
    });

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="w-8 h-8 text-blue-600" />
                            Nurse Tasks
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Manage and track patient care tasks</p>
                    </div>

                    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                        <button
                            onClick={() => setActiveTab('Pending')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'Pending'
                                ? 'bg-blue-100 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Pending Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab('History')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'History'
                                ? 'bg-blue-100 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            History
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Task ID, Patient Name, IPD No..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="relative w-full md:w-64">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-240px)]">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-200 text-left sticky top-0 z-10 shadow-sm">
                                <tr>
                                    {activeTab === 'Pending' && (
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    )}
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Task ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">IPD No.</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Nurse</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Shift</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Frequency</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reminder</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {filteredTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <ClipboardList className="w-12 h-12 text-gray-300 mb-2" />
                                                <p>No tasks found in {activeTab}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTasks.map((task, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            {activeTab === 'Pending' && (
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleStatusUpdate(task.taskId, 'Completed')}
                                                        className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs transition"
                                                    >
                                                        Mark Done
                                                    </button>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 font-medium text-blue-600">{task.taskId}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {task.taskStartDate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 font-medium">{task.ipdNumber}</td>
                                            <td className="px-6 py-4 text-gray-700">{task.patientName}</td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <div className="flex flex-col">
                                                    <span>{task.patientLocation}</span>
                                                    <span className="text-xs text-gray-400">{task.bedNo}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                {task.assignNurse}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{task.shift}</td>
                                            <td className="px-6 py-4 text-gray-700">{task.taskName}</td>
                                            <td className="px-6 py-4 text-gray-500">{task.frequency}</td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {task.reminder === 'Yes' ? (
                                                    <span className="flex items-center gap-1 text-orange-600">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Yes
                                                    </span>
                                                ) : 'No'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tasks;
