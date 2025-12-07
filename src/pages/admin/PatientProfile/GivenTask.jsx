
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    ClipboardList,
    Calendar,
    User,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function GivenTask() {
    const { data } = useOutletContext();
    const [activeTab, setActiveTab] = useState('Pending');
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        loadTasks();
        const interval = setInterval(loadTasks, 2000);
        return () => clearInterval(interval);
    }, [data]);

    const loadTasks = () => {
        if (!data?.personalInfo?.ipd) return;

        const storedTasks = localStorage.getItem('nurseTasks');
        if (storedTasks) {
            const allTasks = JSON.parse(storedTasks);
            // Filter by current patient's IPD Number
            const patientTasks = allTasks.filter(task =>
                task.ipdNumber === data.personalInfo.ipd
            );
            setTasks(patientTasks);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'Pending') {
            return task.status !== 'Completed';
        } else {
            return task.status === 'Completed';
        }
    });

    const handleStatusUpdate = (taskId, newStatus) => {
        const storedTasks = localStorage.getItem('nurseTasks');
        if (storedTasks) {
            const allTasks = JSON.parse(storedTasks);
            const updatedTasks = allTasks.map(t =>
                t.taskId === taskId ? { ...t, status: newStatus } : t
            );
            localStorage.setItem('nurseTasks', JSON.stringify(updatedTasks));
            loadTasks(); // Refresh local list
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                        Assigned Tasks
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Tasks assigned to this patient
                    </p>
                </div>

                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    <button
                        onClick={() => setActiveTab('Pending')}
                        className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${activeTab === 'Pending'
                                ? 'bg-blue-100 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab('History')}
                        className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${activeTab === 'History'
                                ? 'bg-blue-100 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                            {activeTab === 'Pending' && <th className="px-4 py-3">Action</th>}
                            <th className="px-4 py-3">Task ID</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Assign Nurse</th>
                            <th className="px-4 py-3">Shift</th>
                            <th className="px-4 py-3">Tasks</th>
                            <th className="px-4 py-3">Frequency</th>
                            <th className="px-4 py-3">Task Start Date</th>
                            <th className="px-4 py-3">Reminder</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredTasks.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center opacity-60">
                                        <ClipboardList className="w-10 h-10 mb-2" />
                                        No {activeTab.toLowerCase()} tasks found for this patient.
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredTasks.map((task, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    {activeTab === 'Pending' && (
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleStatusUpdate(task.taskId, 'Completed')}
                                                className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs transition"
                                            >
                                                Mark Done
                                            </button>
                                        </td>
                                    )}
                                    <td className="px-4 py-3 font-medium text-blue-600">{task.taskId}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-gray-400" />
                                        {task.assignNurse}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{task.shift || '-'}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{task.taskName}</td>
                                    <td className="px-4 py-3 text-gray-600">{task.frequency}</td>
                                    <td className="px-4 py-3 text-gray-600 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        {task.taskStartDate}
                                    </td>
                                    <td className="px-4 py-3">
                                        {task.reminder === 'Yes' ? (
                                            <span className="flex items-center gap-1 text-orange-600 text-xs font-medium">
                                                <AlertCircle className="w-3.5 h-3.5" /> Yes
                                            </span>
                                        ) : <span className="text-gray-400 text-xs">No</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
