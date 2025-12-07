import React, { useState, useEffect } from 'react';
import { Scissors, CheckCircle, Plus, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const PREDEFINED_OT_TASKS = [
  'Sent to OT(if surgical yes show this task to nurse)',
  'Received in OT',
  'After OT Complete inform to ward',
  'Patient Received in ward',
  'Vitals Check',
  'Inform to RMO',
  'Post of care a) Medication, B) Investigation, C) Vitals',
  'Release Patient'
];

const StatusBadge = ({ status }) => {
  const getColors = () => {
    if (status === 'Completed') return 'bg-green-100 text-green-700 border-green-300';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColors()}`}>
      {status}
    </span>
  );
};

export default function OT() {
  const { data } = useOutletContext();
  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [formData, setFormData] = useState({
    taskName: '',
    status: 'Pending'
  });

  // Initialize tasks
  useEffect(() => {
    if (!data) return;

    // Load history
    let hist = [];
    try {
      const storedHistory = localStorage.getItem('otTasksHistory');
      if (storedHistory) {
        hist = JSON.parse(storedHistory);
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
    setHistoryList(hist);

    // Load pending
    let pending = [];
    try {
      const stored = localStorage.getItem('otTasksPending');
      if (stored) {
        pending = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load pending:', e);
    }

    // Seed if empty
    if ((!pending || pending.length === 0) && hist.length === 0) {
      const initialTasks = PREDEFINED_OT_TASKS.map((task, index) => ({
        taskId: `OT-${Date.now()}-${index}`,
        taskNo: `OT-${String(index + 1).padStart(3, '0')}`,
        taskName: task,
        assignBy: 'Admin',
        nurseName: 'Nurse Joy',
        delayStatus: 'No Delay',
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      }));
      setPendingList(initialTasks);
      localStorage.setItem('otTasksPending', JSON.stringify(initialTasks));
    } else {
      setPendingList(pending || []);
    }
  }, [data]);

  const handleCheckboxChange = (taskId) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTasks(pendingList.map(task => task.taskId));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSubmitSelected = () => {
    if (selectedTasks.length === 0) {
      alert('Please select at least one task to complete.');
      return;
    }

    const tasksToComplete = pendingList.filter(task => selectedTasks.includes(task.taskId));
    const remainingPending = pendingList.filter(task => !selectedTasks.includes(task.taskId));

    const completedTasks = tasksToComplete.map(task => ({
      ...task,
      status: 'Completed',
      completedBy: 'OT Staff',
      completedAt: new Date().toISOString()
    }));

    const updatedHistory = [...completedTasks, ...historyList];

    setPendingList(remainingPending);
    setHistoryList(updatedHistory);
    setSelectedTasks([]);

    try {
      localStorage.setItem('otTasksPending', JSON.stringify(remainingPending));
      localStorage.setItem('otTasksHistory', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to update tasks:', e);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.taskName.trim()) {
      alert('Please select a task');
      return;
    }

    const getNextTaskNo = () => {
      const allTasks = [...pendingList, ...historyList];
      let maxNum = 0;
      allTasks.forEach(t => {
        const num = parseInt((t.taskNo || 'OT-000').replace(/^OT-/, ''), 10);
        if (num > maxNum) maxNum = num;
      });
      return `OT-${String(maxNum + 1).padStart(3, '0')}`;
    };

    const newTask = {
      taskId: `OT-${Date.now()}`,
      taskNo: editMode && selectedTask ? selectedTask.taskNo : getNextTaskNo(),
      taskName: formData.taskName,
      assignBy: 'Admin',
      nurseName: 'Nurse Joy',
      delayStatus: 'No Delay',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    let updatedPendingList;
    if (editMode && selectedTask) {
      updatedPendingList = pendingList.map(task =>
        task.taskId === selectedTask.taskId ? newTask : task
      );
    } else {
      updatedPendingList = [newTask, ...pendingList];
    }

    setPendingList(updatedPendingList);
    localStorage.setItem('otTasksPending', JSON.stringify(updatedPendingList));

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      taskName: '',
      status: 'Pending'
    });
    setSelectedTask(null);
    setEditMode(false);
  };

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Scissors className="w-8 h-8" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">OT Tasks</h1>
              <p className="text-sm opacity-90 mt-1">{data.personalInfo.name} - {data.personalInfo.uhid}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto">
            {activeTab === 'pending' && selectedTasks.length > 0 && (
              <button
                onClick={handleSubmitSelected}
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Complete ({selectedTasks.length})
              </button>
            )}
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Assign Task
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 rounded-lg py-3 px-4 text-center font-bold transition-colors ${activeTab === 'pending'
            ? 'bg-green-600 text-white'
            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
        >
          Pending ({pendingList.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 rounded-lg py-3 px-4 text-center font-bold transition-colors ${activeTab === 'history'
            ? 'bg-green-600 text-white'
            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
        >
          Complete ({historyList.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {activeTab === 'pending' ? (
          pendingList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={pendingList.length > 0 && selectedTasks.length === pendingList.length}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Task No</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Description</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Assign By</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Nurse Name</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Delay Status</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingList.map((task, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.taskId)}
                          onChange={() => handleCheckboxChange(task.taskId)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-green-600 font-semibold">{task.taskNo}</td>
                      <td className="px-4 py-3 text-gray-700">{task.taskName}</td>
                      <td className="px-4 py-3 text-gray-700">{task.assignBy}</td>
                      <td className="px-4 py-3 text-gray-700">{task.nurseName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {task.delayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-gray-600 font-medium">No pending tasks</p>
            </div>
          )
        ) : (
          historyList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Task No</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Description</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Assign By</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Nurse Name</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Delay Status</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((task, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-green-600 font-semibold">{task.taskNo}</td>
                      <td className="px-4 py-3 text-gray-700">{task.taskName}</td>
                      <td className="px-4 py-3 text-gray-700">{task.assignBy}</td>
                      <td className="px-4 py-3 text-gray-700">{task.nurseName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {task.delayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-gray-600 font-medium">No completed tasks</p>
            </div>
          )
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editMode ? 'Edit Task' : 'Assign OT Task'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                <select
                  name="taskName"
                  value={formData.taskName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Select Task</option>
                  {PREDEFINED_OT_TASKS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
