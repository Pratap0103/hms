import React, { useState, useEffect } from 'react';
import { Heart, Plus, X, Trash2, Edit, CheckCircle, Clock, User } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const PREDEFINED_TASKS = [
  'Bed making( New Bed sheet, Pillow)',
  'Patient Received',
  'Patient Wear Down',
  'Vitals Check(BP, Pulse, Temperature, spo2, RR)',
  'Cannulization',
  'Inform to RMO',
  'Medication'
];

const StatusBadge = ({ status }) => {
  const getColors = () => {
    if (status === 'Completed') return 'bg-green-100 text-green-700 border-green-300';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700 border-blue-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColors()}`}>
      {status}
    </span>
  );
};

export default function Nursing() {
  const { data } = useOutletContext();

  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [showNursingModal, setShowNursingModal] = useState(false);
  const [showPaymentSlip, setShowPaymentSlip] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);

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
      completedBy: 'Nurse Joy',
      completedAt: new Date().toISOString()
    }));

    const updatedHistory = [...completedTasks, ...historyList];

    setPendingList(remainingPending);
    setHistoryList(updatedHistory);
    setSelectedTasks([]);

    try {
      localStorage.setItem('nursingTasksPending', JSON.stringify(remainingPending));
      localStorage.setItem('nursingTasksHistory', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to update tasks:', e);
    }
  };

  const [nursingFormData, setNursingFormData] = useState({
    taskName: '',
    priority: 'Medium',
    frequency: 'Once',
    duration: '',
    specialInstructions: '',
    status: 'Pending'
  });

  // Initialize from data and localStorage on component mount
  useEffect(() => {
    if (!data) return;

    // Load history (Complete tasks) from localStorage
    let hist = [];
    try {
      const storedHistory = localStorage.getItem('nursingTasksHistory');
      if (storedHistory) {
        hist = JSON.parse(storedHistory);
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }

    setHistoryList(hist);

    // Load pending from localStorage
    let pending = [];
    try {
      const stored = localStorage.getItem('nursingTasksPending');
      if (stored) {
        pending = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load pending from localStorage:', e);
    }

    // If no pending tasks and no history, seed with predefined tasks
    if ((!pending || pending.length === 0) && hist.length === 0) {
      const initialTasks = PREDEFINED_TASKS.map((task, index) => ({
        taskId: `NT-${Date.now()}-${index}`,
        taskNo: `NT-${String(index + 1).padStart(3, '0')}`,
        admissionNo: data.personalInfo.ipd || '',
        uniqueNumber: data.personalInfo.uhid || '',
        patientName: data.personalInfo.name,
        taskName: task,
        priority: 'Medium',
        frequency: 'Once',
        duration: '15 mins',
        specialInstructions: 'Standard Protocol',
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        assignBy: 'Admin',
        nurseName: 'Nurse Joy',
        delayStatus: 'No Delay'
      }));
      setPendingList(initialTasks);
      localStorage.setItem('nursingTasksPending', JSON.stringify(initialTasks));
    } else {
      setPendingList(pending || []);
    }
  }, [data]);

  // Refresh pending from localStorage when page focus
  useEffect(() => {
    const handleFocus = () => {
      try {
        const stored = localStorage.getItem('nursingTasksPending');
        if (stored) {
          const pending = JSON.parse(stored);
          if (Array.isArray(pending)) {
            setPendingList(pending);
          }
        }
        const storedHistory = localStorage.getItem('nursingTasksHistory');
        if (storedHistory) {
          setHistoryList(JSON.parse(storedHistory));
        }
      } catch (e) {
        console.error('Failed to refresh tasks:', e);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleNursingInputChange = (e) => {
    const { name, value } = e.target;
    setNursingFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNursingSubmit = () => {
    if (!nursingFormData.taskName.trim()) {
      alert('Please select a task');
      return;
    }

    const getNextTaskNo = () => {
      const allTasks = [...pendingList, ...historyList];
      let maxNum = 0;
      allTasks.forEach(t => {
        const num = parseInt((t.taskNo || 'NT-000').replace(/^NT-/, ''), 10);
        if (num > maxNum) maxNum = num;
      });
      return `NT-${String(maxNum + 1).padStart(3, '0')}`;
    };

    const taskNo = getNextTaskNo();

    const newTask = {
      taskId: `NT-${Date.now()}`,
      taskNo,
      admissionNo: data.personalInfo.ipd || '',
      uniqueNumber: data.personalInfo.uhid || data.personalInfo.ipd || '',
      patientName: data.personalInfo.name,
      taskName: nursingFormData.taskName,
      priority: nursingFormData.priority,
      frequency: nursingFormData.frequency,
      duration: nursingFormData.duration,
      specialInstructions: nursingFormData.specialInstructions,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      completedBy: '',
      assignBy: 'Admin',
      nurseName: 'Nurse Joy',
      delayStatus: 'No Delay'
    };

    let updatedPendingList;
    if (editMode && selectedTask) {
      updatedPendingList = pendingList.map(task =>
        task.taskId === selectedTask.taskId ? newTask : task
      );
      setPendingList(updatedPendingList);
    } else {
      updatedPendingList = [newTask, ...pendingList];
      setPendingList(updatedPendingList);
    }

    try {
      localStorage.setItem('nursingTasksPending', JSON.stringify(updatedPendingList));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    setShowNursingModal(false);
    resetForm();
  };

  const handleCompleteTask = (task) => {
    const completedTask = {
      ...task,
      status: 'Completed',
      completedBy: 'Nurse Joy',
      completedAt: new Date().toISOString()
    };

    const updatedPending = pendingList.filter(t => t.taskId !== task.taskId);
    const updatedHistory = [completedTask, ...historyList];

    setPendingList(updatedPending);
    setHistoryList(updatedHistory);

    try {
      localStorage.setItem('nursingTasksPending', JSON.stringify(updatedPending));
      localStorage.setItem('nursingTasksHistory', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to update tasks:', e);
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setNursingFormData({
      taskName: task.taskName,
      priority: task.priority,
      frequency: task.frequency,
      duration: task.duration,
      specialInstructions: task.specialInstructions,
      status: task.status
    });
    setEditMode(true);
    setShowNursingModal(true);
  };

  const handleRemoveTask = (taskId) => {
    const updatedList = pendingList.filter(task => task.taskId !== taskId);
    setPendingList(updatedList);
    try {
      localStorage.setItem('nursingTasksPending', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to remove task:', e);
    }
  };

  const resetForm = () => {
    setNursingFormData({
      taskName: '',
      priority: 'Medium',
      frequency: 'Once',
      duration: '',
      specialInstructions: '',
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
            <Heart className="w-8 h-8" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Nursing Tasks</h1>
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
                setShowNursingModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Assign Task
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Pending and Complete Tabs */}
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

        {/* Pending Section */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {pendingList.length > 0 ? (
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
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Task NO</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Description</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Assign By</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Nurse Name</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Delay Status</th>
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
                          <td className="px-4 py-3 text-gray-700">{task.assignBy || 'Admin'}</td>
                          <td className="px-4 py-3 text-gray-700">{task.nurseName || 'Nurse Joy'}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {task.delayStatus || 'No Delay'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium">No pending tasks</p>
                  <p className="text-gray-500 text-sm">Nursing tasks will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Complete Section */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {historyList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Task NO</th>
                      <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Description</th>
                      <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Assign By</th>
                      <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Nurse Name</th>
                      <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Delay Status</th>
                      <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Completed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyList.map((task, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-green-600 font-semibold">{task.taskNo}</td>
                        <td className="px-4 py-3 text-gray-700">{task.taskName}</td>
                        <td className="px-4 py-3 text-gray-700">{task.assignBy || 'Admin'}</td>
                        <td className="px-4 py-3 text-gray-700">{task.nurseName || 'Nurse Joy'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {task.delayStatus || 'No Delay'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {task.completedAt ? new Date(task.completedAt).toLocaleString() : task.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No completed tasks</p>
                <p className="text-gray-500 text-sm">Completed tasks will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>


      {/* Nursing Task Modal */}
      {
        showNursingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{editMode ? 'Edit Nursing Task' : 'Assign Nursing Task'}</h2>
                <button
                  onClick={() => {
                    setShowNursingModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Patient Info */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <div className="font-medium text-gray-900">{data.personalInfo.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">UHID:</span>
                      <div className="font-medium text-gray-900">{data.personalInfo.uhid}</div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Task Name *</label>
                    <select
                      name="taskName"
                      value={nursingFormData.taskName}
                      onChange={handleNursingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Task</option>
                      {DUMMY_NURSING_TASKS.map((task) => (
                        <option key={task} value={task}>{task}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Priority</label>
                      <select
                        name="priority"
                        value={nursingFormData.priority}
                        onChange={handleNursingInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Frequency</label>
                      <select
                        name="frequency"
                        value={nursingFormData.frequency}
                        onChange={handleNursingInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Once">Once</option>
                        <option value="Twice">Twice</option>
                        <option value="Thrice">Thrice</option>
                        <option value="Every 2 Hours">Every 2 Hours</option>
                        <option value="Every 4 Hours">Every 4 Hours</option>
                        <option value="Every 6 Hours">Every 6 Hours</option>
                        <option value="Daily">Daily</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={nursingFormData.duration}
                      onChange={handleNursingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 15 minutes, 1 hour"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Special Instructions</label>
                    <textarea
                      name="specialInstructions"
                      value={nursingFormData.specialInstructions}
                      onChange={handleNursingInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Any special instructions or notes..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 justify-end mt-6 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNursingModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 w-full font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNursingSubmit}
                    className="px-6 py-2 w-full font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700 sm:w-auto"
                  >
                    {editMode ? 'Update Task' : 'Assign Task'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Confirmation Modal */}
      {
        showPaymentSlip && paymentData && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Task Confirmation</h3>
                <button onClick={() => setShowPaymentSlip(false)} className="text-gray-500 px-2 py-1 rounded hover:bg-gray-100">Close</button>
              </div>

              <div className="text-sm text-gray-700 space-y-2">
                <div className="flex justify-between"><span className="font-medium">Task No</span><span className="text-green-600">{paymentData.taskNo}</span></div>
                <div className="flex justify-between"><span className="font-medium">Task Name</span><span>{paymentData.taskName}</span></div>
                <div className="flex justify-between"><span className="font-medium">Priority</span><span>{paymentData.priority}</span></div>
                <div className="flex justify-between"><span className="font-medium">Frequency</span><span>{paymentData.frequency}</span></div>
                <div className="flex justify-between"><span className="font-medium">Duration</span><span>{paymentData.duration || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="font-medium">Patient</span><span>{paymentData.patientName}</span></div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handlePaymentConfirm}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Confirm & Save
                </button>
                <button onClick={() => setShowPaymentSlip(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
