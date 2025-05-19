import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const AttendanceDashboard = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [chartData, setChartData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({});

    // Add these new functions
    const exportAttendanceFile = async (format) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Session expired. Please log in again.');
                return;
            }
            
            const response = await axios.get(`/api/attendance/export?format=${format}`, {
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Get filename from content-disposition header if available
            let filename = `attendance.${format}`;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }
            
            // Create a blob from the data
            const contentType = format === 'pdf' ? 'application/pdf' : 'text/csv';
            const blob = new Blob([response.data], { type: contentType });
            
            // Create a link to download the file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error(`${format.toUpperCase()} export error:`, error);
            alert(`Export failed: ${error.response?.data?.message || 'Unknown error'}`);
        }
    };

    // Wrap fetchAttendanceData in useCallback to ensure a stable reference
    const fetchAttendanceData = useCallback(async () => {
        try {
            const response = await axios.get('/api/auth/attendance/dashboard', {
                params: {
                    page: currentPage,
                    limit: 10,
                    ...filters,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Add JWT token
                },
            });

            setAttendanceData(response.data.attendanceRecords);
            setTotalPages(response.data.totalPages);

            // Prepare data for the chart
            const dates = response.data.attendanceRecords.map(record => new Date(record.date).toLocaleDateString());
            const clockIns = response.data.attendanceRecords.map(record => (record.clockIn ? 1 : 0));
            setChartData({
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
                <button onClick={() => exportAttendanceFile('pdf')}>
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
                        <th>Status</th>
                        <th>Hours Worked</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceData.map((record) => (
                        <tr key={record._id}>
                            <td>{record.user?.name || record.firstName + ' ' + record.lastName || ''}</td>
                            <td>{record.user?.email || record.email || ''}</td>
                            <td>{record.user?.department || record.department || ''}</td>
                            <td>{record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : '—'}</td>
                            <td>{record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '—'}</td>
                            <td>{record.date ? new Date(record.date).toLocaleDateString() : '—'}</td>
                            <td>{record.status || '—'}</td>
                            <td>{record.hoursWorked != null ? record.hoursWorked : '—'}</td>
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
