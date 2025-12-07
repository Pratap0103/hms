import React, { useState, useEffect } from 'react';
import {
    Award,
    TrendingUp,
    Users,
    CheckCircle,
    Clock,
    AlertCircle,
    BarChart3
} from 'lucide-react';

const Master = () => {
    const [nurseStats, setNurseStats] = useState([]);
    const [summary, setSummary] = useState({
        totalTasks: 0,
        totalCompleted: 0,
        avgScore: 0,
        topPerformer: 'N/A'
    });

    useEffect(() => {
        calculateStats();
        // Refresh every 5 seconds to keep dashboard live
        const interval = setInterval(calculateStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const calculateStats = () => {
        try {
            const storedTasks = localStorage.getItem('nurseTasks');
            const tasks = storedTasks ? JSON.parse(storedTasks) : [];

            if (tasks.length === 0) {
                setNurseStats([]);
                return;
            }

            // Group by Nurse
            const statsMap = {};

            tasks.forEach(task => {
                const nurseName = task.assignNurse || 'Unassigned';
                if (!statsMap[nurseName]) {
                    statsMap[nurseName] = {
                        name: nurseName,
                        total: 0,
                        completed: 0,
                        pending: 0,
                        shifts: new Set(),
                        lastActive: null
                    };
                }

                statsMap[nurseName].total++;
                if (task.status === 'Completed') {
                    statsMap[nurseName].completed++;
                } else {
                    statsMap[nurseName].pending++;
                }

                if (task.shift) {
                    statsMap[nurseName].shifts.add(task.shift);
                }
            });

            // Calculate Scores and Format
            const statsArray = Object.values(statsMap).map(stat => {
                const score = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
                return {
                    ...stat,
                    score: parseFloat(score.toFixed(1)),
                    shifts: Array.from(stat.shifts).join(', ') || 'N/A'
                };
            });

            // Sort by Score Descending
            statsArray.sort((a, b) => b.score - a.score || b.completed - a.completed);

            setNurseStats(statsArray);

            // Calculate Summary
            const totalTasks = tasks.length;
            const totalCompleted = tasks.filter(t => t.status === 'Completed').length;
            const avgScore = statsArray.length > 0
                ? statsArray.reduce((acc, curr) => acc + curr.score, 0) / statsArray.length
                : 0;

            setSummary({
                totalTasks,
                totalCompleted,
                avgScore: parseFloat(avgScore.toFixed(1)),
                topPerformer: statsArray.length > 0 ? statsArray[0].name : 'N/A'
            });

        } catch (error) {
            console.error("Error calculating nurse stats", error);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getProgressBarColor = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Award className="w-8 h-8 text-blue-600" />
                            Nurse Performance Scoreboard
                        </h1>
                        <p className="text-gray-500 mt-1">Real-time performance metrics based on task completion</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        Last Updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Top Performer</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{summary.topPerformer}</h3>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Tasks Assigned</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{summary.totalTasks}</h3>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{((summary.totalCompleted / summary.totalTasks) * 100).toFixed(1)}%</h3>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Active Staff</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{nurseStats.length}</h3>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Staff Performance Rankings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 w-16">Rank</th>
                                    <th className="px-6 py-4">Nurse Name</th>
                                    <th className="px-6 py-4">Assigned Shift</th>
                                    <th className="px-6 py-4 text-center">Total Tasks</th>
                                    <th className="px-6 py-4 text-center">Completed</th>
                                    <th className="px-6 py-4 text-center">Pending</th>
                                    <th className="px-6 py-4 w-1/4">Performance Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {nurseStats.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            No task data available to calculate scores.
                                        </td>
                                    </tr>
                                ) : (
                                    nurseStats.map((stat, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                                'text-gray-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                        <Users className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{stat.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{stat.shifts}</td>
                                            <td className="px-6 py-4 text-center font-medium">{stat.total}</td>
                                            <td className="px-6 py-4 text-center text-green-600 font-bold">{stat.completed}</td>
                                            <td className="px-6 py-4 text-center text-orange-500 font-medium">{stat.pending}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${getProgressBarColor(stat.score)}`}
                                                            style={{ width: `${stat.score}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getScoreColor(stat.score)}`}>
                                                        {stat.score}%
                                                    </span>
                                                </div>
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

export default Master;
