import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';

const AttendanceDashboard = () => {   // Attendance Dashboard Component
    const [attendanceData, setAttendanceData] = useState([]);
    const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });
    const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });  // Chart data for Bar and Pie charts
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);  // Pagination state
    const [filters, setFilters] = useState({});

    // Fetch attendance data
    const fetchAttendanceData = useCallback(async () => {   // Fetch attendance data from the server
        try {
            const response = await axios.get('/api/auth/attendance/dashboard', {
                params: {
                    page: currentPage,
                    limit: 10,
                    ...filters,   // Include filters in the request
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Add JWT token
                },
            });

            setAttendanceData(response.data.attendanceRecords);
            setTotalPages(response.data.totalPages);

            // Prepare data for the Bar Chart
            const dates = response.data.attendanceRecords.map(record => new Date(record.date).toLocaleDateString());
            const clockIns = response.data.attendanceRecords.map(record => (record.clockIn ? 1 : 0));
            setBarChartData({
                labels: dates,
                datasets: [
                    {
                        label: 'Clock-Ins',
                        data: clockIns,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            });

            // Prepare data for the Pie Chart
            const statusCounts = response.data.attendanceRecords.reduce(
                (acc, record) => {
                    if (record.status === 'ontime') acc.ontime += 1;
                    else if (record.status === 'late') acc.late += 1;
                    else if (record.status === 'absent') acc.absent += 1;
                    return acc;
                },
                { ontime: 0, late: 0, absent: 0 }
            );
            setPieChartData({
                labels: ['On Time', 'Late', 'Absent'],
                datasets: [
                    {
                        data: [statusCounts.ontime, statusCounts.late, statusCounts.absent],
                        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
                        hoverBackgroundColor: ['#66bb6a', '#ffb74d', '#e57373'],
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        }
    }, [currentPage, filters]);

    // Use fetchAttendanceData in useEffect
    useEffect(() => {
        fetchAttendanceData();
    }, [fetchAttendanceData]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div>
            <h1>Attendance Dashboard</h1>
            <div>
                <label>
                    User ID:
                    <input type="text" name="userId" onChange={handleFilterChange} />
                </label>
                <label>
                    Start Date:
                    <input type="date" name="startDate" onChange={handleFilterChange} />
                </label>
                <label>
                    End Date:
                    <input type="date" name="endDate" onChange={handleFilterChange} />
                </label>
                <label>
                    Department:
                    <input type="text" name="department" onChange={handleFilterChange} />
                </label>
                <button onClick={fetchAttendanceData}>Apply Filters</button>
            </div>

            {/* Export Buttons */}
            <div>
                <button onClick={() => window.open('/api/auth/attendance/export?format=csv', '_blank')}>
                    Export as CSV
                </button>
                <button onClick={() => window.open('/api/auth/attendance/export?format=pdf', '_blank')}>
                    Export as PDF
                </button>
            </div>

            {/* Bar Chart */}
            <div>
                <h2>Daily Attendance Trends</h2>
                <Bar data={barChartData} />
            </div>

            {/* Pie Chart */}
            <div>
                <h2>Attendance Status Distribution</h2>
                <Pie data={pieChartData} />
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Clock-In</th>
                        <th>Clock-Out</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceData.map((record) => (
                        <tr key={record._id}>
                            <td>{record.user.name}</td>
                            <td>{record.user.email}</td>
                            <td>{record.user.department}</td>
                            <td>{new Date(record.clockIn).toLocaleTimeString()}</td>
                            <td>{record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : 'N/A'}</td>
                            <td>{new Date(record.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default AttendanceDashboard;